import json
import os
import ssl
from pathlib import Path

import certifi
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent

load_dotenv(BASE_DIR / ".env", override=True)

PUBLIC_URL = os.environ["PUBLIC_URL"].strip().rstrip("/")
FRONTEND_URL = os.environ["FRONTEND_URL"].strip().rstrip("/")
CLIENT_ID = os.environ["LTI_CLIENT_ID"].strip()
ISSUER = os.environ["LTI_ISSUER"].strip().rstrip("/")
AUTH_LOGIN_URL = os.environ["LTI_AUTH_LOGIN_URL"].strip()
JWKS_URL = os.environ["LTI_JWKS_URL"].strip()
TOKEN_URL = os.getenv("LTI_TOKEN_URL", f"{ISSUER}/mod/lti/token.php").strip()
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax").strip()
SECRET_KEY = os.environ["SECRET_KEY"].strip()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bashhero.db")
db_file = DATABASE_URL.replace("sqlite:///", "") if DATABASE_URL.startswith("sqlite:") else DATABASE_URL
DB_PATH = Path(db_file)

AGS_CLAIM = "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
AGS_SCORE_SCOPE = "https://purl.imsglobal.org/spec/lti-ags/scope/score"
KID = "bashhero-1"
JWT_LEEWAY_SECONDS = 30 # grace period for token validation due to clock inaccuracy
PRIVATE_KEY_PATH = BASE_DIR / "private.pem"

ssl_context = ssl.create_default_context(cafile=certifi.where())
ssl_context.load_default_certs()

LEVEL_IDS = {
    str(level["id"])
    for path in (BASE_DIR.parent / "app" / "levels").glob("chapter*.json")
    for level in json.loads(path.read_text(encoding="utf-8"))["levels"]
}
