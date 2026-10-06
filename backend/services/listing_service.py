from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from models.models import Listing, Booking, Amenity, Review, Wishlist

def get_listings(
    db: Session, location: str = None, check_in: date = None, check_out: date = None,
    guests: int = None, min_price: float = None, max_price: float = None,
    property_type: str = None, amenities: str = None, bedrooms: int = None,
    page: int = 1, page_size: int = 20, sort: str = None
):
    query = db.query(Listing)
    
    if location:
        query = query.filter(Listing.city.ilike(f"%{location}%") | Listing.country.ilike(f"%{location}%"))
    if guests:
        query = query.filter(Listing.max_guests >= guests)
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)
    if property_type:
        query = query.filter(Listing.property_type == property_type)
    if bedrooms:
        query = query.filter(Listing.bedrooms >= bedrooms)
    
    if amenities:
        amenity_list = amenities.split(',')
        for am in amenity_list:
            query = query.filter(Listing.amenities.any(Amenity.name.ilike(f"%{am}%")))

    if check_in and check_out:
        # Overlap rule: exclude listings that have a confirmed booking overlapping these dates
        overlapping_bookings = db.query(Booking.listing_id).filter(
            Booking.status == 'confirmed',
            Booking.check_in < check_out,
            Booking.check_out > check_in
        )
        query = query.filter(~Listing.id.in_(overlapping_bookings))

    if sort == "price_asc":
        query = query.order_by(Listing.price_per_night.asc())
    elif sort == "price_desc":
        query = query.order_by(Listing.price_per_night.desc())
    else:
        query = query.order_by(Listing.created_at.desc())
        
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return items, total

def get_listing_detail(db: Session, listing_id: int):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None
        
    rating_stats = db.query(
        func.avg(Review.rating).label('avg'),
        func.count(Review.id).label('count')
    ).filter(Review.listing_id == listing_id).first()
    
    return {
        "listing": listing,
        "avg_rating": round(rating_stats.avg, 2) if rating_stats.avg else None,
        "review_count": rating_stats.count
    }

def get_unavailable_dates(db: Session, listing_id: int, start_date: date, end_date: date):
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == 'confirmed',
        Booking.check_in <= end_date,
        Booking.check_out >= start_date
    ).all()
    
    unavailable = []
    from datetime import timedelta
    for b in bookings:
        curr = b.check_in
        while curr < b.check_out:
            unavailable.append(curr.isoformat())
            curr += timedelta(days=1)
    return list(set(unavailable))
