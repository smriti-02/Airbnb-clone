from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_db, get_current_host
from schemas.schemas import ListingSchema, ListingCreate, BookingSchema
from models.models import User, Listing, Booking

router = APIRouter(prefix="/api/host", tags=["host"])

@router.post("/listings", response_model=ListingSchema)
def create_listing(req: ListingCreate, db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    listing = Listing(**req.dict(), host_id=host.id)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/listings/{id}", response_model=ListingSchema)
def update_listing(id: int, req: ListingCreate, db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    listing = db.query(Listing).filter(Listing.id == id, Listing.host_id == host.id).first()
    if not listing: raise HTTPException(status_code=404)
    for k, v in req.dict().items():
        setattr(listing, k, v)
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/listings/{id}")
def delete_listing(id: int, db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    listing = db.query(Listing).filter(Listing.id == id, Listing.host_id == host.id).first()
    if not listing: raise HTTPException(status_code=404)
    db.delete(listing)
    db.commit()
    return {"message": "Deleted successfully"}

@router.get("/listings", response_model=List[ListingSchema])
def my_listings(db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    return db.query(Listing).filter(Listing.host_id == host.id).all()

@router.get("/bookings", response_model=List[BookingSchema])
def my_host_bookings(db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    # Bookings across all my listings
    return db.query(Booking).join(Listing).filter(Listing.host_id == host.id).all()
