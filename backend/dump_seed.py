import os
import json
from datetime import date, datetime

os.environ["IS_TESTING"] = "1"

# In-memory SQLite for dumping
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import database
database.engine = engine
database.SessionLocal = SessionLocal

from database import Base
import seed
from models.models import User, Listing, ListingPhoto, Amenity, Booking, Review

def dump_data():
    # Make sure we don't mess up real DB
    seed.engine = engine
    seed.SessionLocal = SessionLocal

    Base.metadata.create_all(bind=engine)
    seed.main()
    db = SessionLocal()
    
    class DateEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, (date, datetime)):
                return obj.isoformat()
            return super().default(obj)

    def row2dict(row):
        d = {}
        for column in row.__table__.columns:
            d[column.name] = getattr(row, column.name)
        return d

    # dump users
    users = [row2dict(u) for u in db.query(User).all()]
    with open("seed_data/users.json", "w") as f:
        json.dump(users, f, cls=DateEncoder, indent=2)
        
    # dump amenities
    amenities = [row2dict(a) for a in db.query(Amenity).all()]
    with open("seed_data/amenities.json", "w") as f:
        json.dump(amenities, f, cls=DateEncoder, indent=2)
        
    # dump listings
    listings = []
    for l in db.query(Listing).all():
        ld = row2dict(l)
        ld["photos"] = [row2dict(p) for p in l.photos]
        ld["amenities"] = [a.name for a in l.amenities]
        listings.append(ld)
    with open("seed_data/listings.json", "w", encoding="utf-8") as f:
        json.dump(listings, f, cls=DateEncoder, indent=2)
        
    # dump bookings
    bookings = []
    for b in db.query(Booking).all():
        bd = row2dict(b)
        bd["check_in_offset"] = (b.check_in - date.today()).days
        bd["check_out_offset"] = (b.check_out - date.today()).days
        bd["created_at_offset"] = (b.created_at.date() - date.today()).days
        del bd["check_in"]
        del bd["check_out"]
        del bd["created_at"]
        bookings.append(bd)
    with open("seed_data/bookings.json", "w") as f:
        json.dump(bookings, f, cls=DateEncoder, indent=2)
        
    # dump reviews
    reviews = []
    for r in db.query(Review).all():
        rd = row2dict(r)
        rd["created_at_offset"] = (r.created_at.date() - date.today()).days
        del rd["created_at"]
        reviews.append(rd)
    with open("seed_data/reviews.json", "w", encoding="utf-8") as f:
        json.dump(reviews, f, cls=DateEncoder, indent=2)

if __name__ == "__main__":
    os.makedirs("seed_data", exist_ok=True)
    dump_data()
