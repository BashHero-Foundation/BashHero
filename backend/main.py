import json
import logging
import os
import secrets
import sqlite3
import ssl
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode, urlparse, urlsplit, urlunsplit

import certifi
import httpx
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from dotenv import load_dotenv
from fastapi import Cookie, Depends, FastAPI, Form, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

load_dotenv(Path(__file__).with_name(".env"), override=True)

PUBLIC_URL = os.environ["PUBLIC_URL"].strip().rstrip("/")
FRONTEND_URL = os.environ["FRONTEND_URL"].strip().rstrip("/")
CLIENT_ID = os.environ["LTI_CLIENT_ID"].strip()
ISSUER = os.environ["LTI_ISSUER"].strip().rstrip("/")
AUTH_LOGIN_URL = os.environ["LTI_AUTH_LOGIN_URL"].strip()
JWKS_URL = os.environ["LTI_JWKS_URL"].strip()
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax").strip()
SECRET_KEY = os.environ["SECRET_KEY"].strip()

ssl_context = ssl.create_default_context(cafile=certifi.where())
ssl_context.load_default_certs()
jwks_client = jwt.PyJWKClient(JWKS_URL, ssl_context=ssl_context) # client for fetching public keys

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bashhero.db")
db_file = DATABASE_URL.replace("sqlite:///", "") if DATABASE_URL.startswith("sqlite:") else DATABASE_URL
DB_PATH = Path(db_file)

with sqlite3.connect(DB_PATH, timeout=10.0) as conn:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS level_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            level_id TEXT NOT NULL,
            duration REAL NOT NULL,
            wpm INTEGER NOT NULL,
            errors INTEGER NOT NULL,
            accuracy REAL NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

# function for loading the private key or creating it on first start
def load_or_create_private_key(path: Path) -> bytes:
    if path.exists():
        return path.read_bytes()

    pem = rsa.generate_private_key(public_exponent=65537, key_size=2048).private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    )
    # only the owner can read the file (on linux/mac), and an existing file is never overwritten
    try:
        descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        return path.read_bytes()
    with os.fdopen(descriptor, "wb") as key_file:
        key_file.write(pem)
    return pem


logger = logging.getLogger("uvicorn.error")
TOKEN_URL = os.getenv("LTI_TOKEN_URL", f"{ISSUER}/mod/lti/token.php").strip()
AGS_CLAIM = "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
AGS_SCORE_SCOPE = "https://purl.imsglobal.org/spec/lti-ags/scope/score"
KID = "bashhero-1"
JWT_LEEWAY_SECONDS = 30 # grace period for token validation due to clock inaccuracy
PRIVATE_KEY_PEM = load_or_create_private_key(Path(__file__).with_name("private.pem")) # key for signing requests to moodle

LEVEL_IDS = {
    str(level["id"])
    for path in (Path(__file__).parent.parent / "app" / "levels").glob("chapter*.json")
    for level in json.loads(path.read_text(encoding="utf-8"))["levels"]
}


# function for sending a grade to moodle
def send_grade(user_id: str, lineitem: str, completed: int) -> None:
    now = datetime.now(timezone.utc)
    assertion = jwt.encode(
        {
            "iss": CLIENT_ID,
            "sub": CLIENT_ID,
            "aud": TOKEN_URL,
            "iat": now,
            "exp": now + timedelta(minutes=5),
            "jti": secrets.token_urlsafe(16),
        },
        PRIVATE_KEY_PEM,
        algorithm="RS256",
        headers={"kid": KID},
    )
    token_response = httpx.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": assertion,
            "scope": AGS_SCORE_SCOPE,
        },
        timeout=10,
        verify=ssl_context,
    )
    token_response.raise_for_status()

    parts = urlsplit(lineitem)
    scores_url = urlunsplit(parts._replace(path=parts.path.rstrip("/") + "/scores"))
    score_response = httpx.post(
        scores_url,
        json={
            "userId": user_id,
            "scoreGiven": completed,
            "scoreMaximum": len(LEVEL_IDS),
            "activityProgress": "Completed" if completed == len(LEVEL_IDS) else "InProgress",
            "gradingProgress": "FullyGraded",
            "timestamp": now.isoformat(),
        },
        headers={
            "Authorization": f"Bearer {token_response.json()['access_token']}",
            "Content-Type": "application/vnd.ims.lis.v1.score+json",
        },
        timeout=10,
        verify=ssl_context,
    )
    score_response.raise_for_status()


app = FastAPI(title="BashHero LTI backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# function for checking if url points to the frontend
def is_frontend_url(url: str) -> bool:
    expected = urlparse(FRONTEND_URL)
    actual = urlparse(url.strip())
    return actual.netloc.lower().strip() == expected.netloc.lower().strip()


# function for reading the user from the session cookie
def get_current_user(bashhero_session: str | None = Cookie(default=None)) -> dict:
    if not bashhero_session:
        raise HTTPException(status_code=401, detail="LTI session required")
    try:
        return jwt.decode(bashhero_session, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Expired or invalid LTI session")


# class for level result data sent by the frontend
class ResultPayload(BaseModel):
    levelId: str
    duration: float
    WPM: int
    Errors: int
    Accuracy: float
    timestamp: str


# endpoint for checking if the backend is running
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# endpoint for sharing public key with moodle
@app.get("/.well-known/jwks.json")
def jwks() -> dict:
    public_key = serialization.load_pem_private_key(PRIVATE_KEY_PEM, password=None).public_key()
    jwk = jwt.algorithms.RSAAlgorithm.to_jwk(public_key, as_dict=True)
    return {"keys": [{**jwk, "kid": KID, "alg": "RS256", "use": "sig"}]}


# endpoint for starting the lti login
@app.api_route("/lti/login", methods=["GET", "POST"])
async def lti_login(request: Request):
    params = dict(request.query_params)
    if request.method == "POST":
        params.update({key: str(value) for key, value in (await request.form()).items()})

    iss = params.get("iss")
    login_hint = params.get("login_hint")
    target_link_uri = params.get("target_link_uri")
    lti_message_hint = params.get("lti_message_hint")

    if not iss or not login_hint or not target_link_uri:
        raise HTTPException(status_code=400, detail="Missing LTI login parameters")
    if iss != ISSUER:
        raise HTTPException(status_code=400, detail="Unknown LTI issuer")
    if not is_frontend_url(target_link_uri):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid target link URI: received '{target_link_uri}', expected host '{urlparse(FRONTEND_URL).netloc}'",
        )

    nonce = secrets.token_urlsafe(16)
    state = jwt.encode(
        {
            "nonce": nonce,
            "target": target_link_uri,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    auth_params = {
        "scope": "openid",
        "response_type": "id_token",
        "response_mode": "form_post",
        "client_id": CLIENT_ID,
        "redirect_uri": f"{PUBLIC_URL}/lti/launch",
        "login_hint": login_hint,
        "nonce": nonce,
        "state": state,
    }
    if lti_message_hint:
        auth_params["lti_message_hint"] = lti_message_hint

    return RedirectResponse(f"{AUTH_LOGIN_URL}?{urlencode(auth_params)}")


# endpoint for verifying the moodle token and creating a session
@app.post("/lti/launch")
async def lti_launch(
    id_token: str = Form(...),
    state: str = Form(...),
):
    try:
        state_data = jwt.decode(state, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired state")

    expected_nonce = state_data.get("nonce")
    target_link_uri = state_data.get("target")

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(id_token)
        claims = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=ISSUER,
            leeway=JWT_LEEWAY_SECONDS,
        )
    except jwt.PyJWTError as error:
        logger.warning("Rejected LTI token: %r", error)
        raise HTTPException(status_code=401, detail=f"Invalid LTI token: {error}") from error

    if claims.get("nonce") != expected_nonce or not claims.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid LTI nonce or subject")

    session_token = jwt.encode(
        {
            "sub": claims["sub"],
            "iss": claims["iss"],
            "context_id": claims.get("https://purl.imsglobal.org/spec/lti/claim/context", {}).get("id"),
            "ags_lineitem": claims.get(AGS_CLAIM, {}).get("lineitem"),
            "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    redirect = RedirectResponse(target_link_uri or FRONTEND_URL, status_code=303)
    redirect.set_cookie(
        "bashhero_session",
        session_token,
        httponly=True,
        secure=PUBLIC_URL.startswith("https://"),
        samesite=COOKIE_SAMESITE,
        max_age=8 * 60 * 60,
    )
    return redirect


# endpoint for saving a level result and updating the grade
@app.post("/api/results", status_code=204)
def save_result(
    payload: ResultPayload,
    user: dict = Depends(get_current_user),
):
    with sqlite3.connect(DB_PATH, timeout=10.0) as conn:
        conn.execute(
            """
            INSERT INTO level_results (user_id, level_id, duration, wpm, errors, accuracy, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user["sub"],
                payload.levelId,
                payload.duration,
                payload.WPM,
                payload.Errors,
                payload.Accuracy,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        rows = conn.execute(
            "SELECT DISTINCT level_id FROM level_results WHERE user_id = ?", (user["sub"],)
        ).fetchall()

    completed = len({row[0] for row in rows} & LEVEL_IDS) # number of distinct finished levels
    lineitem = user.get("ags_lineitem")
    if not lineitem:
        logger.warning("Missing lineitem: activity does not accept grades from the tool")
    else:
        try:
            send_grade(user["sub"], lineitem, completed)
        except (httpx.HTTPError, KeyError, ValueError):
            logger.exception("Failed to send grade to Moodle")
    return Response(status_code=204)