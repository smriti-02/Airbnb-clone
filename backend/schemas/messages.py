from pydantic import BaseModel, Field, constr
from typing import Optional, List, Literal
from datetime import datetime
from schemas.schemas import UserSchema, ListingSchema

class MessageCreate(BaseModel):
    body: constr(min_length=1, max_length=2000, strip_whitespace=True)

class ConversationCreate(BaseModel):
    listing_id: int
    message: Optional[constr(min_length=1, max_length=2000, strip_whitespace=True)] = None

class MessageSchema(BaseModel):
    id: int
    conversation_id: int
    sender_id: Optional[int]
    body: str
    kind: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBookingSchema(BaseModel):
    check_in: str
    check_out: str
    status: str
    guests: int
    
    class Config:
        from_attributes = True

class ConversationListSchema(BaseModel):
    id: int
    listing: dict
    other_user: dict
    last_message: Optional[dict]
    unread_count: int
    booking: Optional[ConversationBookingSchema]

class ConversationDetailSchema(BaseModel):
    id: int
    listing: dict
    other_user: dict
    booking: Optional[ConversationBookingSchema]
    messages: List[MessageSchema]
    last_read_message_id: Optional[int]

class UnreadCountSchema(BaseModel):
    count: int
