from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, DateTime, Table, CheckConstraint, Index, event
from sqlalchemy.orm import relationship
import sqlalchemy as sa
from datetime import datetime
from database import Base

# Many-to-many
listing_amenities = Table(
    'listing_amenities',
    Base.metadata,
    Column('listing_id', Integer, ForeignKey('listings.id', ondelete='CASCADE'), primary_key=True),
    Column('amenity_id', Integer, ForeignKey('amenities.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    avatar_url = Column(String)
    is_host = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    bio = Column(String)
    joined_at = Column(Date)
    
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="guest", cascade="all, delete-orphan")
    wishlisted_listings = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    property_type = Column(String)
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee_pct = Column(Float, default=0.0)
    city = Column(String, index=True)
    state = Column(String)
    country = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    max_guests = Column(Integer)
    bedrooms = Column(Integer)
    beds = Column(Integer)
    bathrooms = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_listings_city', 'city'),
        Index('idx_listings_price', 'price_per_night'),
    )

    host = relationship("User", back_populates="listings")
    photos = relationship("ListingPhoto", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlisted_by = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

class ListingPhoto(Base):
    __tablename__ = "listing_photos"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    position = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="photos")

class Amenity(Base):
    __tablename__ = "amenities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String)

    listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer)
    nights = Column(Integer)
    subtotal = Column(Float)
    cleaning_fee = Column(Float)
    service_fee = Column(Float)
    total = Column(Float)
    status = Column(String, default="confirmed") # confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('check_out > check_in', name='check_out_after_check_in'),
        Index('idx_bookings_listing_dates', 'listing_id', 'check_in', 'check_out'),
    )

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_1_to_5'),
    )

    listing = relationship("Listing", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")
    guest = relationship("User", back_populates="reviews")

class Wishlist(Base):
    __tablename__ = "wishlists"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlisted_listings")
    listing = relationship("Listing", back_populates="wishlisted_by")

# Overlap rule event listener
@event.listens_for(Booking, 'before_insert')
@event.listens_for(Booking, 'before_update')
def check_booking_overlap(mapper, connection, target):
    if target.status == 'confirmed':
        bookings_table = Booking.__table__
        # Ensure that no confirmed booking overlaps with this one
        stmt = sa.select(sa.func.count()).where(
            bookings_table.c.listing_id == target.listing_id,
            bookings_table.c.status == 'confirmed',
            bookings_table.c.id != (target.id or -1),
            bookings_table.c.check_in < target.check_out,
            bookings_table.c.check_out > target.check_in
        )
        count = connection.scalar(stmt)
        if count > 0:
            raise ValueError("Overlapping confirmed booking exists for this listing.")
