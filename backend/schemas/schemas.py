from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_host: bool
    phone: Optional[str] = None
    phone_verified: bool = False
    joined_at: Optional[date] = None
    class Config:
        from_attributes = True

class AmenitySchema(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    class Config:
        from_attributes = True

class ListingPhotoSchema(BaseModel):
    id: int
    url: str
    position: int
    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str
    price_per_night: float
    cleaning_fee: float = 0.0
    service_fee_pct: float = 0.0
    city: str
    state: Optional[str] = None
    country: str
    address: str
    latitude: float
    longitude: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float

class ListingCreate(ListingBase):
    pass

class ListingSchema(ListingBase):
    id: int
    host_id: int
    host: Optional[UserSchema] = None
    created_at: datetime
    updated_at: datetime
    photos: List[ListingPhotoSchema] = []
    amenities: List[AmenitySchema] = []
    total_for_stay: Optional[float] = None
    nights: Optional[int] = None
    status: str = 'published'
    wizard_step: str = 'done'
    place_type: str = 'entire'
    instant_book: bool = True
    min_nights: int = 1
    highlights: list = []
    safety_details: dict = {}
    new_listing_promo: bool = False
    weekly_discount_pct: int = 0
    monthly_discount_pct: int = 0
    class Config:
        from_attributes = True

class ListingDetailSchema(ListingSchema):
    avg_rating: Optional[float] = None
    review_count: int = 0

class ListingListResponse(BaseModel):
    items: List[ListingSchema]
    total: int
    page: int
    page_size: int

class BookingQuoteRequest(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int

    @validator('check_out')
    def check_dates(cls, v, values):
        if 'check_in' in values and v <= values['check_in']:
            raise ValueError('check_out must be after check_in')
        return v

class BookingQuoteResponse(BaseModel):
    nights: int
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float
    discount_amount: int = 0
    discount_type: Optional[str] = None

class BookingCreate(BookingQuoteRequest):
    pass

class BookingSchema(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float
    discount_amount: int = 0
    discount_type: Optional[str] = None
    host_note: Optional[str] = None
    status: str
    created_at: datetime
    listing: Optional[ListingSchema] = None
    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewSchema(BaseModel):
    id: int
    listing_id: int
    booking_id: int
    guest_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    guest: UserSchema
    class Config:
        from_attributes = True
