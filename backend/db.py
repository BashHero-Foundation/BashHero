import sqlite3
from datetime import datetime, timezone

from config import DB_PATH


# function for opening a connection to the database
def connect() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH, timeout=10.0)


# function for creating tables on startup
def init_db() -> None:
    with connect() as conn:
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


# function for checking if the database is reachable and the table exists
def is_db_ready() -> bool:
    try:
        with connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'level_results'"
            ).fetchone()
        return row is not None
    except sqlite3.Error:
        return False


# function for saving a single level result
def insert_result(
    user_id: str, level_id: str, duration: float, wpm: int, errors: int, accuracy: float
) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO level_results (user_id, level_id, duration, wpm, errors, accuracy, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, level_id, duration, wpm, errors, accuracy, datetime.now(timezone.utc).isoformat()),
        )


# function for reading ids of all levels finished by the user
def get_completed_level_ids(user_id: str) -> set[str]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT DISTINCT level_id FROM level_results WHERE user_id = ?", (user_id,)
        ).fetchall()
    return {row[0] for row in rows}
