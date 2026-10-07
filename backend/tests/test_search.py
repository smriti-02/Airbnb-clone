import pytest
from datetime import date, timedelta
from models.models import User, Listing, Booking
import pytest

@pytest.fixture(scope="function")
def search_db_session(test_db_session):
    db = test_db_session
    # Seed some data for search tests
    host = User(id=1, name="Host", email="h@t.c", is_host=True)
    guest = User(id=2, name="Guest", email="g@t.c", is_host=False)
    db.add_all([host, guest])
    
    listing1 = Listing(
        id=1, host_id=1, title="Jaipur Palace", price_per_night=100.0, cleaning_fee=20.0, 
        service_fee_pct=0.1, city="Jaipur", state="Rajasthan", country="India", max_guests=4, bedrooms=2, beds=2, 
        bathrooms=1, property_type="House", address="123", latitude=26.9, longitude=75.8
    )
    listing2 = Listing(
        id=2, host_id=1, title="Goa Beach House", price_per_night=200.0, cleaning_fee=30.0, 
        service_fee_pct=0.1, city="Goa", state="Goa", country="India", max_guests=6, bedrooms=3, beds=3, 
        bathrooms=2, property_type="Villa", address="124", latitude=15.2, longitude=73.9
    )
    listing3 = Listing(
        id=3, host_id=1, title="Bangalore Apartment", price_per_night=150.0, cleaning_fee=15.0, 
        service_fee_pct=0.1, city="Bengaluru", state="Karnataka", country="India", max_guests=2, bedrooms=1, beds=1, 
        bathrooms=1, property_type="Apartment", address="125", latitude=12.9, longitude=77.5
    )
    db.add_all([listing1, listing2, listing3])
    
    # Confirmed booking for Jaipur (tomorrow to tomorrow+3)
    b1 = Booking(
        listing_id=1, guest_id=2, check_in=date.today() + timedelta(days=1), check_out=date.today() + timedelta(days=4),
        guests=2, nights=3, subtotal=300, cleaning_fee=20, service_fee=30, total=350, status="confirmed"
    )
    # Cancelled booking for Goa (tomorrow to tomorrow+3)
    b2 = Booking(
        listing_id=2, guest_id=2, check_in=date.today() + timedelta(days=1), check_out=date.today() + timedelta(days=4),
        guests=2, nights=3, subtotal=600, cleaning_fee=30, service_fee=60, total=690, status="cancelled"
    )
    db.add_all([b1, b2])
    db.commit()
    
    yield db
    # We do not close the session here as it's scoped to the session fixture


def test_location_partial_case_insensitive(search_db_session, test_client):
    resp = test_client.get("/api/listings?location=jai")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["city"] == "Jaipur"

def test_location_state_match(search_db_session, test_client):
    resp = test_client.get("/api/listings?location=Rajasthan")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["city"] == "Jaipur"

def test_location_alias_match(search_db_session, test_client):
    resp = test_client.get("/api/listings?location=bangalore")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["city"] == "Bengaluru"

def test_guests_capacity(search_db_session, test_client):
    resp = test_client.get("/api/listings?guests=5")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["city"] == "Goa"

def test_date_availability_overlap_excluded(search_db_session, test_client):
    resp = test_client.get(f"/api/listings?check_in={date.today() + timedelta(days=2)}&check_out={date.today() + timedelta(days=5)}")
    assert resp.status_code == 200
    items = resp.json()["items"]
    cities = [item["city"] for item in items]
    assert "Jaipur" not in cities
    assert "Goa" in cities # Cancelled booking doesn't block

def test_date_availability_same_day_turnover(search_db_session, test_client):
    resp = test_client.get(f"/api/listings?check_in={date.today() + timedelta(days=4)}&check_out={date.today() + timedelta(days=6)}")
    assert resp.status_code == 200
    items = resp.json()["items"]
    cities = [item["city"] for item in items]
    assert "Jaipur" in cities

def test_invalid_date_range(search_db_session, test_client):
    resp = test_client.get(f"/api/listings?check_in={date.today() + timedelta(days=5)}&check_out={date.today() + timedelta(days=2)}")
    assert resp.status_code == 422
    
def test_past_date(search_db_session, test_client):
    resp = test_client.get(f"/api/listings?check_in={date.today() - timedelta(days=1)}&check_out={date.today() + timedelta(days=2)}")
    assert resp.status_code == 422

def test_all_filters_combined(search_db_session, test_client):
    # Search "india", guests=2, dates = tomorrow+10 to tomorrow+12
    resp = test_client.get(f"/api/listings?location=india&guests=2&check_in={date.today() + timedelta(days=10)}&check_out={date.today() + timedelta(days=12)}")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 3 # all 3 should match
    
    # check that nights and total_for_stay are returned
    for item in items:
        assert item["nights"] == 2
        assert "total_for_stay" in item
