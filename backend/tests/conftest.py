import os
import pytest

# HARD GUARD: Set DATABASE_URL before importing the app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import database
from database import Base, get_db
from main import app

# Assert at the start of every test that the engine URL is in-memory
@pytest.fixture(scope="session", autouse=True)
def guard_in_memory_db():
    if ":memory:" not in str(database.engine.url) and "%3Amemory%3A" not in str(database.engine.url):
        pytest.fail(f"LOUD FAILURE: DATABASE_URL is not an in-memory database! It is {database.engine.url}")

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

from sqlalchemy import text

@pytest.fixture(scope="function")
def test_db_session():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=test_engine)
    
    # Delete all data
    with test_engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys = OFF;"))
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.execute(text("PRAGMA foreign_keys = ON;"))
        conn.commit()
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def test_client(test_db_session):
    # Depending on test_db_session ensures DB is cleared BEFORE TestClient starts
    with TestClient(app) as c:
        yield c
