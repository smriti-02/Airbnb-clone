from database import SessionLocal
from models.models import Listing, ListingPhoto, Booking, Review
from sqlalchemy import func
import os

db = SessionLocal()
print("Total Listings:", db.query(Listing).count())
states = db.query(Listing.state, func.count(Listing.id)).group_by(Listing.state).all()
print("Listings per state:", states)
print("Photos:", db.query(ListingPhoto).count())
print("Bookings:", db.query(Booking).count())
print("Reviews:", db.query(Review).count())
db.close()

mtime = os.path.getmtime("airbnb_clone.db")
print("Database mtime:", mtime)
