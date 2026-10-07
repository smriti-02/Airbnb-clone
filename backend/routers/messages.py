from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from database import get_db
from dependencies import get_current_user
from models.models import User, Listing, Booking, Conversation, Message, ConversationRead
from schemas.messages import ConversationCreate, MessageCreate, MessageSchema, UnreadCountSchema
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["conversations"])

def _get_unread_count(db: Session, user_id: int) -> int:
    # Conversations where user is participant
    convs = db.query(Conversation).filter(
        or_(Conversation.guest_id == user_id, Conversation.host_id == user_id)
    ).all()
    count = 0
    for c in convs:
        # Get the latest message
        latest = db.query(Message).filter(Message.conversation_id == c.id).order_by(desc(Message.id)).first()
        if not latest:
            continue
        if latest.sender_id == user_id:
            continue # My own message is read
        # check read pointer
        read_ptr = db.query(ConversationRead).filter_by(conversation_id=c.id, user_id=user_id).first()
        if not read_ptr or (read_ptr.last_read_message_id and read_ptr.last_read_message_id < latest.id) or not read_ptr.last_read_message_id:
            count += 1
    return count

@router.get("/conversations")
def list_conversations(page: int = 1, page_size: int = 20, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    offset = (page - 1) * page_size
    convs = db.query(Conversation).filter(
        or_(Conversation.guest_id == user.id, Conversation.host_id == user.id)
    ).order_by(desc(Conversation.last_message_at)).offset(offset).limit(page_size).all()
    
    res = []
    for c in convs:
        listing = db.query(Listing).filter(Listing.id == c.listing_id).first()
        other_user_id = c.host_id if c.guest_id == user.id else c.guest_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        latest = db.query(Message).filter(Message.conversation_id == c.id).order_by(desc(Message.id)).first()
        
        # unread count for this conv
        unread_count = 0
        if latest and latest.sender_id != user.id:
            read_ptr = db.query(ConversationRead).filter_by(conversation_id=c.id, user_id=user.id).first()
            if not read_ptr or not read_ptr.last_read_message_id or read_ptr.last_read_message_id < latest.id:
                # Count messages after read_ptr
                q = db.query(Message).filter(Message.conversation_id == c.id, Message.sender_id != user.id)
                if read_ptr and read_ptr.last_read_message_id:
                    q = q.filter(Message.id > read_ptr.last_read_message_id)
                unread_count = q.count()
                
        booking_dict = None
        if c.booking_id:
            b = db.query(Booking).filter(Booking.id == c.booking_id).first()
            if b:
                booking_dict = {
                    "check_in": b.check_in.isoformat(),
                    "check_out": b.check_out.isoformat(),
                    "status": b.status,
                    "guests": b.guests
                }
        
        res.append({
            "id": c.id,
            "listing": {"id": listing.id, "title": listing.title, "cover_url": listing.photos[0].url if listing.photos else None, "city": listing.city},
            "other_user": {"id": other_user.id, "name": other_user.name, "avatar_url": other_user.avatar_url},
            "last_message": {"body": latest.body[:120], "created_at": latest.created_at, "sender_id": latest.sender_id, "kind": latest.kind} if latest else None,
            "unread_count": unread_count,
            "booking": booking_dict
        })
    return {"items": res, "total": len(res), "page": page, "page_size": page_size}

@router.post("/conversations")
def create_guest_conversation(req: ConversationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listing = db.query(Listing).filter(Listing.id == req.listing_id, Listing.status == 'published').first()
    if not listing:
        raise HTTPException(404, "Listing not found or not published")
    if listing.host_id == user.id:
        raise HTTPException(400, "Host cannot message their own listing")
        
    c = db.query(Conversation).filter_by(listing_id=req.listing_id, guest_id=user.id).first()
    if not c:
        # Find booking
        b = db.query(Booking).filter(
            Booking.listing_id == req.listing_id,
            Booking.guest_id == user.id,
            Booking.status.in_(['confirmed', 'completed']) # Wait, past bookings might be 'confirmed' check_out < today, or 'completed'.
        ).order_by(desc(Booking.created_at)).first()
        
        c = Conversation(listing_id=req.listing_id, guest_id=user.id, host_id=listing.host_id, booking_id=b.id if b else None)
        db.add(c)
        db.commit()
        db.refresh(c)
        
    if req.message:
        msg = Message(conversation_id=c.id, sender_id=user.id, body=req.message)
        db.add(msg)
        c.last_message_at = datetime.utcnow()
        # Mark read for sender
        read = db.query(ConversationRead).filter_by(conversation_id=c.id, user_id=user.id).first()
        if not read:
            read = ConversationRead(conversation_id=c.id, user_id=user.id)
            db.add(read)
        db.commit()
        db.refresh(msg)
        read.last_read_message_id = msg.id
        db.commit()
        
    return {"id": c.id}

@router.post("/host/bookings/{booking_id}/conversation")
def create_host_conversation(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_host:
        raise HTTPException(403, "Not a host")
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    listing = db.query(Listing).filter(Listing.id == b.listing_id).first()
    if not listing or listing.host_id != user.id:
        raise HTTPException(403, "Not your booking")
        
    c = db.query(Conversation).filter_by(listing_id=b.listing_id, guest_id=b.guest_id).first()
    if not c:
        c = Conversation(listing_id=b.listing_id, guest_id=b.guest_id, host_id=user.id, booking_id=b.id)
        db.add(c)
        db.commit()
        db.refresh(c)
    return {"id": c.id}

@router.get("/conversations/{id}")
def get_conversation(id: int, before_id: Optional[int] = None, after_id: Optional[int] = None, limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c or (c.guest_id != user.id and c.host_id != user.id):
        raise HTTPException(404, "Not found")
        
    q = db.query(Message).filter(Message.conversation_id == id)
    if after_id:
        q = q.filter(Message.id > after_id)
        q = q.order_by(asc(Message.id))
    elif before_id:
        q = q.filter(Message.id < before_id)
        q = q.order_by(desc(Message.id))
    else:
        q = q.order_by(desc(Message.id))
        
    messages = q.limit(limit).all()
    if not after_id:
        messages.reverse()
        
    listing = db.query(Listing).filter(Listing.id == c.listing_id).first()
    other_user_id = c.host_id if c.guest_id == user.id else c.guest_id
    other_user = db.query(User).filter(User.id == other_user_id).first()
    
    booking_dict = None
    if c.booking_id:
        b = db.query(Booking).filter(Booking.id == c.booking_id).first()
        if b:
            booking_dict = {
                "check_in": b.check_in.isoformat(),
                "check_out": b.check_out.isoformat(),
                "status": b.status,
                "guests": b.guests
            }
            
    read_ptr = db.query(ConversationRead).filter_by(conversation_id=id, user_id=user.id).first()
            
    return {
        "id": c.id,
        "listing": {"id": listing.id, "title": listing.title, "cover_url": listing.photos[0].url if listing.photos else None, "city": listing.city},
        "other_user": {"id": other_user.id, "name": other_user.name, "avatar_url": other_user.avatar_url, "joined_at": other_user.joined_at.isoformat() if other_user.joined_at else None},
        "booking": booking_dict,
        "messages": [MessageSchema.model_validate(m) for m in messages],
        "last_read_message_id": read_ptr.last_read_message_id if read_ptr else None
    }

@router.post("/conversations/{id}/messages", response_model=MessageSchema)
def add_message(id: int, req: MessageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c or (c.guest_id != user.id and c.host_id != user.id):
        raise HTTPException(404, "Not found")
        
    # Rate limit check
    one_min_ago = datetime.utcnow() - timedelta(minutes=1)
    recent_count = db.query(Message).filter(
        Message.sender_id == user.id,
        Message.created_at >= one_min_ago
    ).count()
    if recent_count >= 20:
        raise HTTPException(429, "Rate limit exceeded")
        
    msg = Message(conversation_id=c.id, sender_id=user.id, body=req.body)
    db.add(msg)
    c.last_message_at = datetime.utcnow()
    
    # mark own read
    db.commit()
    db.refresh(msg)
    
    read = db.query(ConversationRead).filter_by(conversation_id=c.id, user_id=user.id).first()
    if not read:
        read = ConversationRead(conversation_id=c.id, user_id=user.id)
        db.add(read)
    read.last_read_message_id = msg.id
    db.commit()
    
    return msg

@router.post("/conversations/{id}/read")
def read_conversation(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c or (c.guest_id != user.id and c.host_id != user.id):
        raise HTTPException(404, "Not found")
        
    latest = db.query(Message).filter(Message.conversation_id == id).order_by(desc(Message.id)).first()
    if latest:
        read = db.query(ConversationRead).filter_by(conversation_id=c.id, user_id=user.id).first()
        if not read:
            read = ConversationRead(conversation_id=c.id, user_id=user.id)
            db.add(read)
        read.last_read_message_id = latest.id
        db.commit()
    return {"status": "ok"}

@router.get("/messages/unread-count", response_model=UnreadCountSchema)
def get_unread_count(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return {"count": _get_unread_count(db, user.id)}
