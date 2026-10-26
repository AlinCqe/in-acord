import os
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

DEFAULT_DATABASE_URL = f"sqlite+pysqlite:///{(DATA_DIR / 'in-acord.db').as_posix()}"
DATABASE_URL = os.getenv("IN_ACORD_DATABASE_URL", DEFAULT_DATABASE_URL)

engine_options: dict[str, object] = {
    "connect_args": {"check_same_thread": False},
}

if DATABASE_URL.endswith(":memory:"):
    engine_options["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def create_tables() -> None:
    # Folosit pentru primul prototip. Alembic va prelua migrările înainte de
    # prima versiune cu date reale.
    Base.metadata.create_all(bind=engine)


def get_session() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session

