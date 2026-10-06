from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from dependencies import get_db
from schemas.schemas import ListingSchema, ListingListResponse, ListingDetailSchema, ReviewSchema
from services.listing_service import get_listings, get_listing_detail, get_unavailable_dates
from models.models import Review

router = APIRouter(prefix="/api/listings", tags=["listings"])

@router.get("", response_model=ListingListResponse)
def list_listings(
    location: Optional[str] = None, check_in: Optional[date] = None, check_out: Optional[date] = None,
    guests: Optional[int] = None, min_price: Optional[float] = None, max_price: Optional[float] = None,
    property_type: Optional[str] = None, amenities: Optional[str] = None, bedrooms: Optional[int] = None,
    page: int = 1, page_size: int = 20, sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    items, total = get_listings(db, location, check_in, check_out, guests, min_price, max_price, property_type, amenities, bedrooms, page, page_size, sort)
    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{id}", response_model=ListingDetailSchema)
def get_listing(id: int, db: Session = Depends(get_db)):
    res = get_listing_detail(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    obj = res["listing"]
    obj.avg_rating = res["avg_rating"]
    obj.review_count = res["review_count"]
    return obj

@router.get("/{id}/availability")
def get_availability(id: int, month: str = Query(..., description="YYYY-MM"), db: Session = Depends(get_db)):
    try:
        y, m = map(int, month.split('-'))
        start = date(y, m, 1)
        import calendar
        _, last_day = calendar.monthrange(y, m)
        end = date(y, m, last_day)
    except:
        raise HTTPException(status_code=400, detail="Invalid month format, use YYYY-MM")
        
    dates = get_unavailable_dates(db, id, start, end)
    return {"unavailable_dates": dates}

@router.get("/{id}/reviews", response_model=List[ReviewSchema])
def get_reviews(id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.listing_id == id).all()
