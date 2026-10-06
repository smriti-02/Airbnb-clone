import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import date, timedelta
from database import get_db, Base, engine, SessionLocal
from models.models import User, Listing

client = TestClient(app)

# Use test db
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    # Seed some data for tests
    host = User(id=1, name="Host", email="h@t.c", is_host=True)
    guest = User(id=2, name="Guest", email="g@t.c", is_host=False)
    db.add_all([host, guest])
    db.commit()
    
    listing = Listing(
        id=1, host_id=1, title="Test", price_per_night=100.0, cleaning_fee=20.0, 
        service_fee_pct=0.1, city="TestCity", max_guests=4, bedrooms=1, beds=1, 
        bathrooms=1, property_type="Apartment", country="USA", address="123 Main St", 
        latitude=40.0, longitude=-70.0
    )
    db.add(listing)
    db.commit()
    
    yield db
    db.close()

def test_price_calculation(db_session):
    # Quote endpoint
    req = {
        "listing_id": 1,
        "check_in": str(date.today() + timedelta(days=1)),
        "check_out": str(date.today() + timedelta(days=4)), # 3 nights
        "guests": 2
    }
    resp = client.post("/api/bookings/quote", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["nights"] == 3
    assert data["subtotal"] == 300.0
    assert data["cleaning_fee"] == 20.0
    assert data["service_fee"] == 30.0 # 10% of 300
    assert data["total"] == 350.0

def test_overlap_prevention(db_session):
    headers = {"X-User-Id": "2"}
    # Book dates 10 to 15
    check_in = str(date.today() + timedelta(days=10))
    check_out = str(date.today() + timedelta(days=15))
    
    req = {
        "listing_id": 1,
        "check_in": check_in,
        "check_out": check_out,
        "guests": 2
    }
    
    resp = client.post("/api/bookings", json=req, headers=headers)
    assert resp.status_code == 200
    
    # Try to book overlapping dates (14 to 18)
    req2 = req.copy()
    req2["check_in"] = str(date.today() + timedelta(days=14))
    req2["check_out"] = str(date.today() + timedelta(days=18))
    
    resp2 = client.post("/api/bookings", json=req2, headers=headers)
    assert resp2.status_code == 409
    assert "no longer available" in resp2.json()["detail"]
    
def test_search_filtering_by_dates(db_session):
    # Since dates 10 to 15 are booked, searching for those dates should exclude listing 1
    resp = client.get(f"/api/listings?check_in={str(date.today() + timedelta(days=10))}&check_out={str(date.today() + timedelta(days=12))}")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 0
    
    # Searching for dates 15 to 20 should include it (since checkout is exactly on 15, they don't overlap)
    resp = client.get(f"/api/listings?check_in={str(date.today() + timedelta(days=15))}&check_out={str(date.today() + timedelta(days=20))}")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 1
