from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from models.models import User

def get_current_user(x_user_id: int = Header(..., description="User ID (mock auth)"), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_host(user: User = Depends(get_current_user)) -> User:
    if not user.is_host:
        raise HTTPException(status_code=403, detail="Must be a host")
    return user
