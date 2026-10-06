import random
import datetime
from database import engine, Base, SessionLocal
from models.domain import User, Listing, Photo, Amenity, Booking, Review

# 1. Configuration & Data Pools
CITIES = [
    ("Goa", "India"), ("Mumbai", "India"), ("Manali", "India"), ("Jaipur", "India"), 
    ("Bali", "Indonesia"), ("Paris", "France"), ("New York", "USA"), 
    ("Tokyo", "Japan"), ("Lisbon", "Portugal"), ("Santorini", "Greece")
]
PROPERTY_TYPES = ["Apartment", "Villa", "Cabin", "Beachfront", "Treehouse", "Farm", "Castle", "Tiny home", "Mansion", "Loft"]
AMENITIES_LIST = [
    ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Pool", "pool"), ("Air conditioning", "ac"),
    ("Washer", "washer"), ("Free parking", "parking"), ("Hot tub", "hot-tub"), ("TV", "tv"),
    ("Heating", "heating"), ("Dedicated workspace", "workspace"), ("Gym", "gym"), 
    ("BBQ grill", "bbq"), ("Fire pit", "fire-pit"), ("Indoor fireplace", "fireplace"),
    ("Breakfast", "breakfast"), ("Ski-in/Ski-out", "ski"), ("Waterfront", "water"),
    ("Smoke alarm", "smoke"), ("First aid kit", "aid"), ("Fire extinguisher", "extinguisher")
]

UNSPLASH_IDS = [
    "1522708323590-d24dbb6b0267", "1480074568708-e8b5c010bab8", "1502672260266-1c1b56112f59",
    "1512917774080-9991f1c4c750", "1493809842364-4bf87b648003", "1494438639946-1ebd1d20bf85",
    "1518780664697-55e3ad937233", "1501183638710-841f58925562", "1449844908441-8829872d2607",
    "1528909514045-2ba4ae4a4a58", "1472224371017-0824efa9a116", "1505691938895-1758d7feb511",
    "1430285561322-780f5f52cece", "1515263487990-61b07816bc8e", "1475855581690-80ba6452f15e",
    "1497362948500-f02016ed3d2c", "1510798831971-6d1ebaf8f829", "1416331108676-a22ccb276e35"
]

TITLES = ["Beautiful", "Cozy", "Luxury", "Stunning", "Modern", "Historic", "Spacious", "Quiet", "Charming"]
NOUNS = ["Getaway", "Retreat", "Oasis", "Hideaway", "Sanctuary", "Escape", "Haven"]

REVIEWS_TEXT = [
    "Amazing place, will definitely come back!", "The host was incredibly welcoming.", 
    "Place was a bit dusty but overall good.", "Perfect location, easy to walk everywhere.",
    "Views are to die for. Highly recommended.", "Comfortable beds and very quiet.",
    "Could use some updates, but great value.", "Felt right at home, 10/10.",
    "Not exactly as pictured, but still nice.", "Absolutely magical experience."
]

def generate_random_photo():
    uid = random.choice(UNSPLASH_IDS)
    return f"https://images.unsplash.com/photo-{uid}?auto=format&fit=crop&w=800&q=80"

def generate_avatar(name):
    clean_name = name.lower().replace(' ', '')
    return f"https://i.pravatar.cc/150?u={clean_name}"

def main():
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("Seeding Amenities...")
        amenities = []
        for name, icon in AMENITIES_LIST:
            a = Amenity(name=name, icon=icon)
            db.add(a)
            amenities.append(a)
        db.commit()

        print("Seeding Users...")
        users = []
        # 3 Hosts
        for i in range(1, 4):
            u = User(name=f"Host {i}", email=f"host{i}@example.com", avatar_url=generate_avatar(f"Host {i}"), is_host=True)
            db.add(u)
            users.append(u)
        # 3 Guests
        for i in range(1, 4):
            u = User(name=f"Guest {i}", email=f"guest{i}@example.com", avatar_url=generate_avatar(f"Guest {i}"), is_host=False)
            db.add(u)
            users.append(u)
        db.commit()
        
        hosts = [u for u in users if u.is_host]
        guests = [u for u in users if not u.is_host]

        print("Seeding Listings & Photos...")
        listings = []
        for i in range(45):
            city, country = random.choice(CITIES)
            prop_type = random.choice(PROPERTY_TYPES)
            title = f"{random.choice(TITLES)} {prop_type} {random.choice(NOUNS)} in {city}"
            desc = f"Experience the best of {city} in this {title.lower()}. Fully equipped and ready for your stay!"
            
            host = random.choice(hosts)
            
            listing = Listing(
                host_id=host.id,
                title=title,
                description=desc,
                city=city,
                country=country,
                property_type=prop_type,
                price_per_night=round(random.uniform(50, 800), 2),
                max_guests=random.randint(1, 10),
                bedrooms=random.randint(1, 5),
                beds=random.randint(1, 7),
                baths=random.choice([1, 1.5, 2, 2.5, 3]),
            )
            
            # Assign 5-10 random amenities
            num_amens = random.randint(5, 15)
            listing.amenities = random.sample(amenities, num_amens)
            
            db.add(listing)
            db.flush() # to get listing.id
            listings.append(listing)
            
            # Assign exactly 5 photos
            for _ in range(5):
                db.add(Photo(listing_id=listing.id, url=generate_random_photo()))
                
        db.commit()

        print("Seeding Bookings & Reviews...")
        today = datetime.date.today()
        bookings_count = 0
        reviews_count = 0
        
        # We will create about 2 bookings per listing
        for listing in listings:
            # Past booking (Completed)
            guest1 = random.choice(guests)
            past_start = today - datetime.timedelta(days=random.randint(10, 60))
            past_end = past_start + datetime.timedelta(days=random.randint(2, 7))
            days1 = (past_end - past_start).days
            
            past_booking = Booking(
                listing_id=listing.id,
                guest_id=guest1.id,
                check_in=past_start,
                check_out=past_end,
                total_price=days1 * listing.price_per_night,
                status="completed"
            )
            db.add(past_booking)
            db.flush()
            bookings_count += 1
            
            # Review for past booking (about 80% chance)
            if random.random() < 0.8:
                review1 = Review(
                    listing_id=listing.id,
                    guest_id=guest1.id,
                    booking_id=past_booking.id,
                    rating=random.randint(3, 5),
                    comment=random.choice(REVIEWS_TEXT),
                    created_at=past_end + datetime.timedelta(days=1) # created after check out
                )
                db.add(review1)
                reviews_count += 1
            
            # Future booking (Confirmed) - 50% chance
            if random.random() < 0.5:
                guest2 = random.choice(guests)
                future_start = today + datetime.timedelta(days=random.randint(5, 30))
                future_end = future_start + datetime.timedelta(days=random.randint(2, 7))
                days2 = (future_end - future_start).days
                
                future_booking = Booking(
                    listing_id=listing.id,
                    guest_id=guest2.id,
                    check_in=future_start,
                    check_out=future_end,
                    total_price=days2 * listing.price_per_night,
                    status="confirmed"
                )
                db.add(future_booking)
                bookings_count += 1
                
        db.commit()
        
        print("\n=== Seeding Summary ===")
        print(f"Users: {len(users)} (3 hosts, 3 guests)")
        print(f"Amenities: {len(amenities)}")
        print(f"Listings: {len(listings)}")
        print(f"Photos: {len(listings) * 5}")
        print(f"Bookings: {bookings_count}")
        print(f"Reviews: {reviews_count}")
        print("=======================")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
