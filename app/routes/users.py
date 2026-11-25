from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, ProfileUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = payload.email.lower()
    duplicate = db.scalar(select(User).where(User.email == email, User.id != current_user.id))
    if duplicate:
        raise HTTPException(status_code=409, detail="That email address is already in use")
    current_user.name = payload.name.strip()
    current_user.email = email
    db.commit()
    db.refresh(current_user)
    return current_user
