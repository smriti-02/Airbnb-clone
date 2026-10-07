from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, DateTime, Table, CheckConstraint, Index, event, JSON
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
    phone = Column(String, unique=True, nullable=True)
    phone_verified = Column(Boolean, default=False, server_default='0')
    
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

    status = Column(String, default='published', server_default="'published'")
    wizard_step = Column(String, default='done', server_default="'done'")
    place_type = Column(String, default='entire', server_default="'entire'")
    instant_book = Column(Boolean, default=True, server_default='1')
    min_nights = Column(Integer, default=1, server_default='1')
    highlights = Column(JSON, default=list, server_default='[]')
    safety_details = Column(JSON, default=dict, server_default='{}')
    new_listing_promo = Column(Boolean, default=False, server_default='0')
    weekly_discount_pct = Column(Integer, default=0, server_default='0')
    monthly_discount_pct = Column(Integer, default=0, server_default='0')
    published_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index('idx_listings_city', 'city'),
        Index('idx_listings_state', 'state'),
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
    discount_amount = Column(Integer, default=0, server_default='0')
    discount_type = Column(String, nullable=True)
    host_note = Column(String, nullable=True)
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

class BlockedDate(Base):
    __tablename__ = "blocked_dates"
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    date = Column(Date, primary_key=True)

    __table_args__ = (
        Index('idx_blocked_dates_listing_date', 'listing_id', 'date'),
    )

class PriceOverride(Base):
    __tablename__ = "price_overrides"
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    date = Column(Date, primary_key=True)
    price = Column(Integer, nullable=False)

class HostVerification(Base):
    __tablename__ = "host_verifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    id_type = Column(String, nullable=False)
    document_filename = Column(String, nullable=False)
    status = Column(String, default='pending') # pending, verified, rejected
    submitted_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        sa.UniqueConstraint('listing_id', 'guest_id', name='uq_conversation_listing_guest'),
        Index('idx_conversations_guest_last_msg', 'guest_id', 'last_message_at'),
        Index('idx_conversations_host_last_msg', 'host_id', 'last_message_at'),
    )

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    body = Column(String, nullable=False)
    kind = Column(String, default="user") # 'user' | 'system'
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('length(body) >= 1 AND length(body) <= 2000', name='message_body_length'),
        Index('idx_messages_conv_id', 'conversation_id', 'id'),
    )

    conversation = relationship("Conversation", back_populates="messages")

class ConversationRead(Base):
    __tablename__ = "conversation_reads"
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    last_read_message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
