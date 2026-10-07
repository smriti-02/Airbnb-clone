from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from models.models import Listing, Booking, PriceOverride

def calculate_price(db: Session, listing_id: int, check_in: date, check_out: date):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None
        
    nights = (check_out - check_in).days
    if nights <= 0:
        return None

    # Calculate nightly subtotal using overrides
    overrides = db.query(PriceOverride).filter(
        PriceOverride.listing_id == listing_id,
        PriceOverride.date >= check_in,
        PriceOverride.date < check_out
    ).all()
    override_map = {o.date: o.price for o in overrides}
    
    nightly_total = 0
    curr = check_in
    while curr < check_out:
        nightly_total += override_map.get(curr, listing.price_per_night)
        curr += timedelta(days=1)
        
    discount_amount = 0
    discount_type = None

    # Check for new listing promo
    promo_applies = False
    if listing.new_listing_promo:
        confirmed_bookings_count = db.query(Booking).filter(
            Booking.listing_id == listing_id,
            Booking.status == 'confirmed'
        ).count()
        if confirmed_bookings_count < 3:
            promo_applies = True
            
    if promo_applies:
        discount_amount = int(nightly_total * 0.20)
        discount_type = "new_listing"
    else:
        # Check weekly/monthly
        monthly_pct = listing.monthly_discount_pct or 0
        weekly_pct = listing.weekly_discount_pct or 0
        
        monthly_discount = int(nightly_total * (monthly_pct / 100)) if nights >= 28 else 0
        weekly_discount = int(nightly_total * (weekly_pct / 100)) if nights >= 7 else 0
        
        if monthly_discount > 0 and monthly_discount >= weekly_discount:
            discount_amount = monthly_discount
            discount_type = "monthly"
        elif weekly_discount > 0:
            discount_amount = weekly_discount
            discount_type = "weekly"

    discounted_subtotal = nightly_total - discount_amount
    cleaning_fee = listing.cleaning_fee or 0
    service_fee = int(discounted_subtotal * (listing.service_fee_pct or 0))
    total = int(discounted_subtotal + cleaning_fee + service_fee)

    return {
        "nights": nights,
        "subtotal": int(nightly_total),
        "discount_amount": int(discount_amount),
        "discount_type": discount_type,
        "cleaning_fee": int(cleaning_fee),
        "service_fee": int(service_fee),
        "total": total
    }
