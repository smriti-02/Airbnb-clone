import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from models.models import User, Listing, Booking, Conversation, Message, ConversationRead
from datetime import date

# In-memory DB for tests
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create users
    u1 = User(id=1, name="Host", email="h@example.com", is_host=True)
    u2 = User(id=2, name="Guest", email="g@example.com", is_host=False)
    u3 = User(id=3, name="Stranger", email="s@example.com", is_host=False)
    db.add_all([u1, u2, u3])
    
    # Create listing
    l1 = Listing(id=1, host_id=1, title="L1", price_per_night=100, city="C", country="I", address="A", latitude=0, longitude=0, status="published", max_guests=2, min_nights=1, property_type="House", bedrooms=1, beds=1, bathrooms=1.0)
    db.add(l1)
    db.commit()
    
    yield
    
    Base.metadata.drop_all(bind=engine)

def test_host_cant_message_own_listing():
    res = client.post("/api/conversations", json={"listing_id": 1, "message": "hello"}, headers={"X-User-Id": "1"})
    assert res.status_code == 400
    assert "Host cannot message their own listing" in res.json()["detail"]

def test_get_or_create_idempotent():
    # 1st time
    res1 = client.post("/api/conversations", json={"listing_id": 1}, headers={"X-User-Id": "2"})
    assert res1.status_code == 200
    id1 = res1.json()["id"]
    
    # 2nd time
    res2 = client.post("/api/conversations", json={"listing_id": 1}, headers={"X-User-Id": "2"})
    assert res2.status_code == 200
    assert res2.json()["id"] == id1

def test_non_participant_404():
    res1 = client.post("/api/conversations", json={"listing_id": 1}, headers={"X-User-Id": "2"})
    cid = res1.json()["id"]
    
    # Stranger tries to read
    res = client.get(f"/api/conversations/{cid}", headers={"X-User-Id": "3"})
    assert res.status_code == 404
    
    # Stranger tries to message
    res = client.post(f"/api/conversations/{cid}/messages", json={"body": "spy"}, headers={"X-User-Id": "3"})
    assert res.status_code == 404

def test_unread_counts_and_read_pointer():
    res1 = client.post("/api/conversations", json={"listing_id": 1}, headers={"X-User-Id": "2"})
    cid = res1.json()["id"]
    
    # Guest sends message
    client.post(f"/api/conversations/{cid}/messages", json={"body": "msg1"}, headers={"X-User-Id": "2"})
    
    # Host unread count should be 1
    h_unread = client.get("/api/messages/unread-count", headers={"X-User-Id": "1"}).json()
    assert h_unread["count"] == 1
    
    # Guest unread count should be 0
    g_unread = client.get("/api/messages/unread-count", headers={"X-User-Id": "2"}).json()
    assert g_unread["count"] == 0
    
    # Host reads it
    client.post(f"/api/conversations/{cid}/read", headers={"X-User-Id": "1"})
    
    h_unread2 = client.get("/api/messages/unread-count", headers={"X-User-Id": "1"}).json()
    assert h_unread2["count"] == 0

def test_body_validation_and_rate_limit():
    res1 = client.post("/api/conversations", json={"listing_id": 1}, headers={"X-User-Id": "2"})
    cid = res1.json()["id"]
    
    # Empty body
    res = client.post(f"/api/conversations/{cid}/messages", json={"body": ""}, headers={"X-User-Id": "2"})
    assert res.status_code == 422
    
    # Too long body
    res = client.post(f"/api/conversations/{cid}/messages", json={"body": "A" * 2001}, headers={"X-User-Id": "2"})
    assert res.status_code == 422
    
    # Rate limit (send 20 messages, 21st fails)
    for i in range(20):
        res = client.post(f"/api/conversations/{cid}/messages", json={"body": "hello"}, headers={"X-User-Id": "2"})
        assert res.status_code == 200
        
    res = client.post(f"/api/conversations/{cid}/messages", json={"body": "too many"}, headers={"X-User-Id": "2"})
    assert res.status_code == 429

def test_booking_creates_system_message():
    from schemas.schemas import BookingCreate
    # Make a booking
    payload = {
        "listing_id": 1,
        "check_in": str(date.today()),
        "check_out": str(date.today().replace(day=date.today().day+2)),
        "guests": 1
    }
    # Wait, we need to mock calculate_price or it will fail?
    # Our DB has no block dates, generate_quote should work if we have property price
    # Let's just call the endpoint.
    res = client.post("/api/bookings", json=payload, headers={"X-User-Id": "2"})
    assert res.status_code == 200, res.text
    
    # Check conversation
    convs = client.get("/api/conversations", headers={"X-User-Id": "2"}).json()["items"]
    assert len(convs) == 1
    assert convs[0]["last_message"]["kind"] == "system"
    assert "Reservation confirmed" in convs[0]["last_message"]["body"]

def test_messaging_failure_does_not_break_booking(monkeypatch):
    import models.models as m
    old_msg = m.Message
    def fake_msg(*args, **kwargs):
        raise Exception("Simulated DB failure")
    monkeypatch.setattr(m, "Message", fake_msg)
    
    payload = {
        "listing_id": 1,
        "check_in": str(date.today().replace(day=date.today().day+4)),
        "check_out": str(date.today().replace(day=date.today().day+6)),
        "guests": 1
    }
    res = client.post("/api/bookings", json=payload, headers={"X-User-Id": "2"})
    assert res.status_code == 200 # Booking still succeeds!
