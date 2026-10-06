from sqlalchemy.orm import Session
from datetime import date
from models.models import Booking, Listing
from schemas.schemas import BookingQuoteRequest, BookingCreate
from fastapi import HTTPException

def generate_quote(db: Session, req: BookingQuoteRequest):
    listing = db.query(Listing).filter(Listing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if req.guests > listing.max_guests:
        raise HTTPException(status_code=400, detail="Too many guests")
        
    nights = (req.check_out - req.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid dates")
        
    subtotal = nights * listing.price_per_night
    cleaning_fee = listing.cleaning_fee
    service_fee = subtotal * listing.service_fee_pct
    total = subtotal + cleaning_fee + service_fee
    
    return {
        "nights": nights,
        "subtotal": round(subtotal, 2),
        "cleaning_fee": round(cleaning_fee, 2),
        "service_fee": round(service_fee, 2),
        "total": round(total, 2)
    }

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
        status="confirmed"
    )
    
    db.add(booking)
    try:
        db.commit()
        db.refresh(booking)
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
    return booking
