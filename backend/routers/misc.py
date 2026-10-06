from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_db, get_current_user
from schemas.schemas import ReviewCreate, ReviewSchema, AmenitySchema, UserSchema, ListingSchema
from models.models import User, Amenity, Review, Booking, Wishlist, Listing
from datetime import date

router = APIRouter(prefix="/api", tags=["misc"])

@router.get("/amenities", response_model=List[AmenitySchema])
def get_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).all()

@router.get("/users", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/wishlist", response_model=List[ListingSchema])
def my_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Listing).join(Wishlist).filter(Wishlist.user_id == user.id).all()

@router.post("/wishlist/{listing_id}")
def add_wishlist(listing_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(Wishlist).filter_by(user_id=user.id, listing_id=listing_id).first()
    if not existing:
        db.add(Wishlist(user_id=user.id, listing_id=listing_id))
        db.commit()
    return {"message": "Added to wishlist"}

@router.delete("/wishlist/{listing_id}")
def remove_wishlist(listing_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Wishlist).filter_by(user_id=user.id, listing_id=listing_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Removed from wishlist"}

@router.post("/reviews", response_model=ReviewSchema)
def create_review(req: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == req.booking_id, Booking.guest_id == user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.check_out > date.today():
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
        
    existing = db.query(Review).filter_by(booking_id=req.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
        
    review = Review(
        listing_id=booking.listing_id,
        booking_id=booking.id,
        guest_id=user.id,
        rating=req.rating,
        comment=req.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
