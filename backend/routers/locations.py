from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from dependencies import get_db
from models.models import Listing
from typing import Optional
from utils import published_listings

router = APIRouter(prefix="/api/locations", tags=["locations"])

TAGLINES = {
    "Goa": "For its seaside charm",
    "Udaipur": "Known for its lakes",
    "Mumbai": "The city that never sleeps",
    "Jaipur": "The Pink City",
    "Manali": "Mountain retreats",
    "Delhi": "A mix of history and modern life",
    "New Delhi": "A mix of history and modern life",
    "Varanasi": "Spiritual capital of India",
    "Pondicherry": "French colonial heritage",
    "Kerala": "God's own country",
    "Bengaluru": "The Silicon Valley of India"
}

ALIAS_MAP = {
    "bangalore": "bengaluru",
    "bombay": "mumbai",
    "madras": "chennai",
    "calcutta": "kolkata",
    "benares": "varanasi",
    "pondicherry": "puducherry",
    "goa": "goa"
}

@router.get("/suggest")
def suggest_locations(q: Optional[str] = "", db: Session = Depends(get_db)):
    query = published_listings(db.query(Listing))
    query = query.with_entities(
        Listing.city, Listing.state, func.count(Listing.id).label('listing_count')
    ).group_by(Listing.city, Listing.state)

    if q:
        tokens = [t.strip().lower() for t in q.replace('  ', ' ').split(',')]
        for token in tokens:
            if not token: continue
            token = ALIAS_MAP.get(token, token)
            query = query.filter(
                Listing.city.ilike(f"%{token}%") |
                Listing.state.ilike(f"%{token}%") |
                Listing.country.ilike(f"%{token}%")
            )
            
    # sort by most popular
    results = query.order_by(func.count(Listing.id).desc()).limit(8).all()
    
    response = []
    for r in results:
        label = f"{r.city}, {r.state}"
        tagline = TAGLINES.get(r.city, "Popular destination")
        response.append({
            "label": label,
            "city": r.city,
            "state": r.state,
            "listing_count": r.listing_count,
            "tagline": tagline
        })
    return response
