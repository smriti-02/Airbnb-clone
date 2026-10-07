"""
FREEZE RULE:
Never modify, regenerate, delete or reformat anything in /backend/seed_data or backend/seed.py 
unless the user explicitly asks for a seed data change in that message. 
Tests must never use the real database. Never drop or recreate airbnb.db unless the user asks.
"""

import json
import os
import argparse
from datetime import date, datetime, timedelta
from database import engine, Base, SessionLocal
from models.models import User, Listing, ListingPhoto, Amenity, Booking, Review

def load_json(filename):
    with open(os.path.join(os.path.dirname(__file__), "seed_data", filename), "r", encoding="utf-8") as f:
        return json.load(f)

def main(reset=False):
    if reset:
        print("Resetting database...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(Listing).count()
        if existing > 0 and not reset:
            print("Database already seeded, skipping.")
            return

        print("Seeding Users...")
        users_data = load_json("users.json")
        for u in users_data:
            joined = datetime.fromisoformat(u["joined_at"]).date() if u.get("joined_at") else date.today()
            user = User(
                id=u["id"], name=u["name"], email=u["email"], 
                avatar_url=u["avatar_url"], is_host=u["is_host"], 
                bio=u.get("bio"), joined_at=joined
            )
            db.add(user)
        db.commit()

        print("Seeding Amenities...")
        amenities_data = load_json("amenities.json")
        amenities_dict = {}
        for a in amenities_data:
            am = Amenity(id=a["id"], name=a["name"], icon=a["icon"])
            db.add(am)
            amenities_dict[a["name"]] = am
        db.commit()

        print("Seeding Listings & Photos...")
        listings_data = load_json("listings.json")
        for l in listings_data:
            listing = Listing(
                id=l["id"], host_id=l["host_id"], title=l["title"], description=l["description"],
                property_type=l["property_type"], price_per_night=l["price_per_night"],
                cleaning_fee=l["cleaning_fee"], service_fee_pct=l["service_fee_pct"],
                city=l["city"], state=l["state"], country=l["country"], address=l["address"],
                latitude=l["latitude"], longitude=l["longitude"], max_guests=l["max_guests"],
                bedrooms=l["bedrooms"], beds=l["beds"], bathrooms=l["bathrooms"]
            )
            for a_name in l["amenities"]:
                listing.amenities.append(amenities_dict[a_name])
            db.add(listing)
            
            for p in l["photos"]:
                photo = ListingPhoto(id=p["id"], listing_id=l["id"], url=p["url"], position=p["position"])
                db.add(photo)
        db.commit()

        print("Seeding Bookings & Reviews...")
        bookings_data = load_json("bookings.json")
        for b in bookings_data:
            check_in = date.today() + timedelta(days=b["check_in_offset"])
            check_out = date.today() + timedelta(days=b["check_out_offset"])
            booking = Booking(
                id=b["id"], listing_id=b["listing_id"], guest_id=b["guest_id"],
                check_in=check_in, check_out=check_out, guests=b["guests"],
                nights=b["nights"], subtotal=b["subtotal"], cleaning_fee=b["cleaning_fee"],
                service_fee=b["service_fee"], total=b["total"], status=b["status"]
            )
            db.add(booking)
        db.commit()

        reviews_data = load_json("reviews.json")
        for r in reviews_data:
            created_at = datetime.combine(date.today() + timedelta(days=r["created_at_offset"]), datetime.min.time())
            review = Review(
                id=r["id"], listing_id=r["listing_id"], booking_id=r["booking_id"],
                guest_id=r["guest_id"], rating=r["rating"], comment=r["comment"],
                created_at=created_at
            )
            db.add(review)
        db.commit()

        print("\n=== Seeding Summary ===")
        print(f"Users: {len(users_data)}")
        print(f"Listings: {len(listings_data)}")
        print(f"Bookings: {len(bookings_data)}")
        print(f"Reviews: {len(reviews_data)}")
        print("=======================")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Drop all tables and reseed")
    args = parser.parse_args()
    main(reset=args.reset)
