from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401 — înregistrează modelele SQLAlchemy
from app.database import create_tables
from app.routers import songs


PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="În Acord API",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/api/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(songs.router, prefix="/api")

# Montarea frontendului rămâne ultima, pentru ca rutele /api să aibă prioritate.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

