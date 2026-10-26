import os

import pytest
from fastapi.testclient import TestClient


os.environ["IN_ACORD_DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client

