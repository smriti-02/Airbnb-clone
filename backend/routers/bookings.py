from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_db, get_current_user
from schemas.schemas import BookingCreate, BookingSchema, BookingQuoteRequest, BookingQuoteResponse
from services.booking_service import create_booking, cancel_booking, generate_quote
from models.models import User, Booking

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/quote", response_model=BookingQuoteResponse)
def quote_booking(req: BookingQuoteRequest, db: Session = Depends(get_db)):
    return generate_quote(db, req)

@router.post("", response_model=BookingSchema)
def book_listing(req: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_booking(db, req, user.id)

@router.get("/me", response_model=List[BookingSchema])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Booking).filter(Booking.guest_id == user.id).order_by(Booking.check_in.desc()).all()

@router.post("/{id}/cancel", response_model=BookingSchema)
def cancel(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cancel_booking(db, id, user.id)
