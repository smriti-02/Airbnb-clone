from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

listing_amenity_association = Table(
    'listing_amenities',
    Base.metadata,
    Column('listing_id', Integer, ForeignKey('listings.id')),
    Column('amenity_id', Integer, ForeignKey('amenities.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    avatar_url = Column(String)
    is_host = Column(Boolean, default=False)

    listings = relationship("Listing", back_populates="host")
    bookings = relationship("Booking", back_populates="guest")
    reviews = relationship("Review", back_populates="guest")

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    city = Column(String)
    country = Column(String)
    property_type = Column(String)
    price_per_night = Column(Float)
    max_guests = Column(Integer)
    bedrooms = Column(Integer)
    beds = Column(Integer)
    baths = Column(Float)

    host = relationship("User", back_populates="listings")
    photos = relationship("Photo", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary=listing_amenity_association, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")

class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    url = Column(String)

    listing = relationship("Listing", back_populates="photos")

class Amenity(Base):
    __tablename__ = "amenities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    icon = Column(String)

    listings = relationship("Listing", secondary=listing_amenity_association, back_populates="amenities")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    guest_id = Column(Integer, ForeignKey("users.id"))
    check_in = Column(Date)
    check_out = Column(Date)
    total_price = Column(Float)
    status = Column(String) # confirmed, cancelled, completed

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    guest_id = Column(Integer, ForeignKey("users.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    guest = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")
