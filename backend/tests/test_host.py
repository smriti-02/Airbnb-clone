import pytest
from fastapi.testclient import TestClient
from main import app
from models.models import User, Listing, Booking, HostVerification
from datetime import date, timedelta
from sqlalchemy.orm import Session

client = TestClient(app)

def test_otp_flow(test_db_session: Session):
    db = test_db_session
    # Send OTP
    res = client.post("/api/auth/otp/send", json={"identifier": "+919876543210"})
    assert res.status_code == 200
    assert res.json()["sent"] == True

    # Verify wrong OTP
    res = client.post("/api/auth/otp/verify", json={"identifier": "+919876543210", "otp": "000000"})
    assert res.status_code == 400

    # Verify new user missing names
    res = client.post("/api/auth/otp/verify", json={"identifier": "+919876543210", "otp": "123456"})
    assert res.status_code == 422
    
    # Verify new user valid
    res = client.post("/api/auth/otp/verify", json={
        "identifier": "+919876543210", 
        "otp": "123456",
        "first_name": "Test",
        "last_name": "User"
    })
    assert res.status_code == 200
    user_id = res.json()["id"]
    
    # Existing user logs in
    res = client.post("/api/auth/otp/verify", json={"identifier": "+919876543210", "otp": "123456"})
    assert res.status_code == 200
    assert res.json()["id"] == user_id

def test_host_draft_flow(test_db_session: Session):
    db = test_db_session
    # Login user
    res = client.post("/api/auth/otp/verify", json={
        "identifier": "host@test.com", 
        "otp": "123456",
        "first_name": "Host",
        "last_name": "User"
    })
    host_id = res.json()["id"]
    headers = {"X-User-Id": str(host_id)}
    
    # Create draft
    res = client.post("/api/host/listings/draft", headers=headers)
    assert res.status_code == 200
    listing_id = res.json()["id"]
    assert res.json()["status"] == "draft"
    
    # Patch validation
    res = client.patch(f"/api/host/listings/{listing_id}", json={"price_per_night": 100}, headers=headers)
    assert res.status_code == 422 # ge=500
    
    # Publish returns missing list
    res = client.post(f"/api/host/listings/{listing_id}/publish", headers=headers)
    assert res.status_code == 422
    missing = res.json()["detail"]["missing"]
    assert "title" in missing
    assert "price" in missing
    
    # Fill required fields
    client.patch(f"/api/host/listings/{listing_id}", json={
        "title": "Valid Title",
        "description": "Valid Description",
        "city": "Goa",
        "state": "Goa",
        "address": "123 Test St",
        "latitude": 15.0,
        "longitude": 73.0,
        "price_per_night": 1000,
        "max_guests": 2,
        "beds": 1
    }, headers=headers)
    
    # Still needs 5 photos and verified status
    res = client.post(f"/api/host/listings/{listing_id}/publish", headers=headers)
    assert res.status_code == 422
    assert "photos" in res.json()["detail"]["missing"]
    assert "verification" in res.json()["detail"]["missing"]

    # Owner-only 403 (or 404 since it filters by host_id)
    res = client.patch(f"/api/host/listings/{listing_id}", json={"title": "Hacked"}, headers={"X-User-Id": "999"})
    assert res.status_code in [401, 403, 404]

def test_published_listings_visibility(test_db_session: Session):
    db = test_db_session
    # Setup
    host = User(name="H", email="h@t.com", is_host=True)
    db.add(host)
    db.commit()
    
    draft = Listing(host_id=host.id, title="Draft", price_per_night=1000, status="draft", property_type="House", city="Goa", country="India", address="A", latitude=1, longitude=1, max_guests=1, bedrooms=1, beds=1, bathrooms=1)
    published = Listing(host_id=host.id, title="Published", price_per_night=1000, status="published", property_type="House", city="Goa", country="India", address="B", latitude=1, longitude=1, max_guests=1, bedrooms=1, beds=1, bathrooms=1)
    db.add_all([draft, published])
    db.commit()
    
    # detail
    res = client.get(f"/api/listings/{draft.id}")
    assert res.status_code == 404
    res = client.get(f"/api/listings/{published.id}")
    assert res.status_code == 200
    
    # owner can see draft detail
    res = client.get(f"/api/listings/{draft.id}", headers={"X-User-Id": str(host.id)})
    assert res.status_code == 200
    
    # search
    res = client.get("/api/listings?location=Goa")
    items = [x["id"] for x in res.json()["items"]]
    assert published.id in items
    assert draft.id not in items

def test_delete_listing_with_booking(test_db_session: Session):
    db = test_db_session
    host = User(name="H2", email="h2@t.com", is_host=True)
    db.add(host)
    db.commit()
    l = Listing(host_id=host.id, title="L", price_per_night=1000, status="published")
    db.add(l)
    db.commit()
    
    guest = User(name="G", email="g@t.com")
    db.add(guest)
    db.commit()
    
    b = Booking(
        listing_id=l.id, guest_id=guest.id, 
        check_in=date.today() + timedelta(days=1),
        check_out=date.today() + timedelta(days=2),
        guests=1, status="confirmed"
    )
    db.add(b)
    db.commit()
    
    res = client.delete(f"/api/host/listings/{l.id}", headers={"X-User-Id": str(host.id)})
    assert res.status_code == 409
    assert "Unlist it instead" in res.json()["detail"]

def test_pricing_and_availability(test_db_session: Session):
    db = test_db_session
    host = User(name="H3", email="h3@t.com", is_host=True)
    guest = User(name="G3", email="g3@t.com", is_host=False)
    db.add_all([host, guest])
    db.commit()
    
    l = Listing(
        host_id=host.id, title="L", price_per_night=1000, status="published", 
        new_listing_promo=True, min_nights=2, max_guests=2, cleaning_fee=100,
        property_type="House", city="Goa", country="India", address="A", latitude=1, longitude=1, bedrooms=1, beds=1, bathrooms=1
    )
    db.add(l)
    db.commit()
    
    # min_nights enforced
    in_date = date.today() + timedelta(days=5)
    out_date = in_date + timedelta(days=1)
    res = client.post("/api/bookings/quote", json={
        "listing_id": l.id, "check_in": in_date.isoformat(), "check_out": out_date.isoformat(), "guests": 1
    })
    assert res.status_code == 422
    
    # Promo logic (20% off)
    out_date2 = in_date + timedelta(days=2)
    res = client.post("/api/bookings/quote", json={
        "listing_id": l.id, "check_in": in_date.isoformat(), "check_out": out_date2.isoformat(), "guests": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert data["subtotal"] == 2000
    assert data["discount_amount"] == 400
    assert data["total"] == 1600 + 100 # 1700
    
    # Block a date
    client.put(f"/api/host/listings/{l.id}/calendar", json={
        "dates": [in_date.isoformat()], "action": "block"
    }, headers={"X-User-Id": str(host.id)})
    
    # Booking overlaps block
    res = client.post("/api/bookings", json={
        "listing_id": l.id, "check_in": in_date.isoformat(), "check_out": out_date2.isoformat(), "guests": 1
    }, headers={"X-User-Id": str(guest.id)})
    assert res.status_code == 409
    
    # Unavailable dates includes block
    res = client.get(f"/api/listings/{l.id}/availability?month={in_date.strftime('%Y-%m')}")
    assert in_date.isoformat() in res.json()["unavailable_dates"]
