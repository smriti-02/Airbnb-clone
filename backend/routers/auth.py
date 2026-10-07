from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models.models import User
from schemas.schemas import UserSchema
from schemas.host_schemas import OTPSendRequest, OTPVerifyRequest
from settings import MOCK_OTP
import re
from datetime import date

router = APIRouter(prefix="/api/auth", tags=["auth"])

def is_valid_identifier(identifier: str):
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    phone_regex = r"^(\+91)?[6-9]\d{9}$"
    return re.match(email_regex, identifier) or re.match(phone_regex, identifier)

@router.post("/otp/send")
def send_otp(req: OTPSendRequest):
    if not is_valid_identifier(req.identifier):
        raise HTTPException(status_code=400, detail="Invalid email or phone number")
    return {"sent": True, "hint": f"Demo OTP is {MOCK_OTP}"}

@router.post("/otp/verify", response_model=UserSchema)
def verify_otp(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    if req.otp != MOCK_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    is_phone = bool(re.match(r"^(\+91)?[6-9]\d{9}$", req.identifier))
    
    query = db.query(User)
    if is_phone:
        user = query.filter(User.phone == req.identifier).first()
    else:
        user = query.filter(User.email == req.identifier).first()
        
    if user:
        if is_phone and not user.phone_verified:
            user.phone_verified = True
            db.commit()
        return user
        
    # User does not exist, create
    if not req.first_name or not req.last_name:
        raise HTTPException(status_code=422, detail="First name and last name are required for new users")
        
    name = f"{req.first_name} {req.last_name}"
    avatar_url = f"https://i.pravatar.cc/150?u={req.identifier}"
    
    new_user = User(
        name=name,
        email=req.identifier if not is_phone else f"{req.identifier}@example.com",
        phone=req.identifier if is_phone else None,
        phone_verified=is_phone,
        avatar_url=avatar_url,
        is_host=False,
        joined_at=date.today()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
