from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class OTPSendRequest(BaseModel):
    identifier: str

class OTPVerifyRequest(BaseModel):
    identifier: str
    otp: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class HostListingDraft(BaseModel):
    pass # Empty since we just create a draft and return it

class ListingPublishRequest(BaseModel):
    pass

class ListingPatchRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    price_per_night: Optional[int] = Field(None, ge=500, le=100000)
    cleaning_fee: Optional[int] = Field(None, ge=0, le=10000)
    pincode: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: Optional[int] = Field(None, ge=1, le=16)
    beds: Optional[int] = Field(None, ge=1)
    bedrooms: Optional[int] = Field(None, ge=0, le=20)
    bathrooms: Optional[float] = Field(None, ge=1)
    highlights: Optional[List[str]] = None
    amenities: Optional[List[int]] = None
    weekly_discount_pct: Optional[int] = Field(None, ge=0, le=50)
    monthly_discount_pct: Optional[int] = Field(None, ge=0, le=50)
    min_nights: Optional[int] = Field(None, ge=1, le=30)
    wizard_step: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    property_type: Optional[str] = None
    place_type: Optional[str] = None

class PhotoUrlRequest(BaseModel):
    url: str

class PhotoOrderRequest(BaseModel):
    ids: List[int]

class CalendarUpdate(BaseModel):
    dates: List[date]
    action: str # "block" | "unblock"

class CalendarPriceUpdate(BaseModel):
    dates: List[date]
    price: Optional[int] = None

class HostNoteUpdate(BaseModel):
    host_note: str
