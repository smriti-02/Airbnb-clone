import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import User, Listing, Booking
from datetime import date

from sqlalchemy.pool import StaticPool

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
    u1 = User(id=1, name="Host 1", email="host1@example.com", is_host=True)
    u2 = User(id=2, name="Host 2", email="host2@example.com", is_host=True)
    u3 = User(id=3, name="Guest", email="guest@example.com", is_host=False)
    db.add_all([u1, u2, u3])
    db.commit()
    
    # Create listings
    l1 = Listing(id=1, host_id=1, title="L1", property_type="House", price_per_night=100, city="C", country="I", address="A", latitude=0, longitude=0, status="published", max_guests=2, bedrooms=1, beds=1, bathrooms=1.0)
    l2 = Listing(id=2, host_id=1, title="L2", property_type="House", price_per_night=100, city="C", country="I", address="A", latitude=0, longitude=0, status="published", max_guests=2, bedrooms=1, beds=1, bathrooms=1.0)
    l3 = Listing(id=3, host_id=2, title="L3", property_type="House", price_per_night=100, city="C", country="I", address="A", latitude=0, longitude=0, status="published", max_guests=2, bedrooms=1, beds=1, bathrooms=1.0)
    db.add_all([l1, l2, l3])
    db.commit()
    
    from datetime import date, timedelta
    tomorrow = date.today() + timedelta(days=1)
    end_date = date.today() + timedelta(days=5)
    b1 = Booking(id=1, listing_id=1, guest_id=3, check_in=tomorrow, check_out=end_date, status="confirmed", nights=4, subtotal=400, cleaning_fee=0, service_fee=0, total=400, guests=2)
    db.add(b1)
    db.commit()
    
    yield
    
    Base.metadata.drop_all(bind=engine)

def test_host_listings_api():
    # /api/host/listings returns exactly the listings with that host_id
    res1 = client.get("/api/host/listings", headers={"X-User-Id": "1"}).json()
    assert len(res1) == 2
    assert set(l["id"] for l in res1) == {1, 2}
    
    res2 = client.get("/api/host/listings", headers={"X-User-Id": "2"}).json()
    assert len(res2) == 1
    assert set(l["id"] for l in res2) == {3}
    
    # The same ids appear in /api/listings
    # Wait, /api/listings doesn't take host_id. We just get all.
    guest_res = client.get("/api/listings").json()["items"]
    guest_ids = {l["id"] for l in guest_res}
    
    assert {1, 2, 3}.issubset(guest_ids)
    
    # And check the host info is included in guest endpoints
    for l in guest_res:
        assert "host" in l
        assert l["host"]["id"] == l["host_id"]

def test_host_reservations_api():
    # A booking on a host's listing appears in /api/host/reservations for that host
    res1 = client.get("/api/host/reservations?bucket=upcoming", headers={"X-User-Id": "1"}).json()
    assert "items" in res1
    assert len(res1["items"]) == 1
    assert res1["items"][0]["id"] == 1
    
    # And for no other host
    res2 = client.get("/api/host/reservations?bucket=upcoming", headers={"X-User-Id": "2"}).json()
    assert "items" in res2
    assert len(res2["items"]) == 0
