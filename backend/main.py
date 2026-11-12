import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db
import lti
from config import FRONTEND_URL, LEVEL_IDS

logger = logging.getLogger("uvicorn.error")


# function for preparing the database on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="BashHero LTI backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(lti.router)


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
def health(response: Response) -> dict[str, str]:
    if not db.is_db_ready():
        response.status_code = 503
        return {"status": "error", "database": "unavailable"}
    return {"status": "ok", "database": "ok"}


# endpoint for saving a level result and updating the grade
@app.post("/api/results", status_code=204)
def save_result(
    payload: ResultPayload,
    user: dict = Depends(lti.get_current_user),
):
    if (
        payload.levelId not in LEVEL_IDS
        or not (0 <= payload.WPM < 500)
        or payload.duration <= 0
        or payload.Errors < 0
    ):
        raise HTTPException(status_code=422, detail="Invalid result data")
    
    db.insert_result(
        user["sub"],
        payload.levelId,
        payload.duration,
        payload.WPM,
        payload.Errors,
        payload.Accuracy,
    )

    completed = len(db.get_completed_level_ids(user["sub"]) & LEVEL_IDS) # number of distinct finished levels
    lineitem = user.get("ags_lineitem")
    if not lineitem:
        logger.warning("Missing lineitem: activity does not accept grades from the tool")
    else:
        try:
            lti.send_grade(user["sub"], lineitem, completed)
        except (httpx.HTTPError, KeyError, ValueError):
            logger.exception("Failed to send grade to Moodle")
    return Response(status_code=204)
