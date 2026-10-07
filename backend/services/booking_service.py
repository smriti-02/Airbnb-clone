from sqlalchemy.orm import Session
from datetime import date, datetime
import logging
from models.models import Booking, Listing, BlockedDate, Conversation, Message
from schemas.schemas import BookingQuoteRequest, BookingCreate
from fastapi import HTTPException
from services.pricing import calculate_price
from database import SessionLocal

logger = logging.getLogger(__name__)

def _add_system_message(db: Session, booking_id: int, text: str):
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return
        c = db.query(Conversation).filter_by(listing_id=booking.listing_id, guest_id=booking.guest_id).first()
        if not c:
            listing = db.query(Listing).filter(Listing.id == booking.listing_id).first()
            c = Conversation(listing_id=booking.listing_id, guest_id=booking.guest_id, host_id=listing.host_id, booking_id=booking.id)
            db.add(c)
            db.commit()
            db.refresh(c)
        else:
            c.booking_id = booking.id
        
        msg = Message(conversation_id=c.id, kind='system', body=text)
        db.add(msg)
        c.last_message_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Messaging failure: {e}")

def generate_quote(db: Session, req: BookingQuoteRequest):
    listing = db.query(Listing).filter(Listing.id == req.listing_id).first()
    if not listing or listing.status != 'published':
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if req.guests > listing.max_guests:
        raise HTTPException(status_code=400, detail="Too many guests")
        
    if (req.check_out - req.check_in).days < listing.min_nights:
        raise HTTPException(status_code=422, detail=f"Minimum stay is {listing.min_nights} nights")
        
    price_info = calculate_price(db, req.listing_id, req.check_in, req.check_out)
    if not price_info:
        raise HTTPException(status_code=400, detail="Invalid dates")
        
    return price_info

def create_booking(db: Session, req: BookingCreate, guest_id: int):
    # Overlap check
    overlapping = db.query(Booking).filter(
        Booking.listing_id == req.listing_id,
        Booking.status == 'confirmed',
        Booking.check_in < req.check_out,
        Booking.check_out > req.check_in
    ).first()
    
    if overlapping:
        raise HTTPException(status_code=409, detail="These dates are no longer available")
        
    blocked = db.query(BlockedDate).filter(
        BlockedDate.listing_id == req.listing_id,
        BlockedDate.date >= req.check_in,
        BlockedDate.date < req.check_out
    ).first()
    
    if blocked:
        raise HTTPException(status_code=409, detail="Some of these dates are not available")
        
    quote = generate_quote(db, req)
    
    booking = Booking(
        listing_id=req.listing_id,
        guest_id=guest_id,
        check_in=req.check_in,
        check_out=req.check_out,
        guests=req.guests,
        nights=quote["nights"],
        subtotal=quote["subtotal"],
        cleaning_fee=quote["cleaning_fee"],
        service_fee=quote["service_fee"],
        total=quote["total"],
        discount_amount=quote["discount_amount"],
        discount_type=quote["discount_type"],
        status="confirmed"
    )
    
    db.add(booking)
    try:
        db.commit()
        db.refresh(booking)
        
        cin = booking.check_in.strftime("%d %b") if hasattr(booking.check_in, "strftime") else str(booking.check_in)
        cout = booking.check_out.strftime("%d %b") if hasattr(booking.check_out, "strftime") else str(booking.check_out)
        text = f"Reservation confirmed · {cin}-{cout} · {booking.guests} guest{'s' if booking.guests > 1 else ''}"
        _add_system_message(db, booking.id, text)
        
        return booking
    except ValueError as e: # Caught by the event listener as an extra safety measure
        db.rollback()
        raise HTTPException(status_code=409, detail=str(e))

def cancel_booking(db: Session, booking_id: int, user_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.guest_id == user_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "cancelled"
    db.commit()
    
    _add_system_message(db, booking.id, "Reservation cancelled")
    
    return booking
