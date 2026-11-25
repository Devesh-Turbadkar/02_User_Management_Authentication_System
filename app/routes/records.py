from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.record import Record
from app.models.user import User
from app.schemas.record import RecordCreate, RecordUpdate, RecordResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/records", tags=["Records"])


@router.get("/", response_model=list[RecordResponse])
def list_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Record).where(Record.owner_id == current_user.id).order_by(Record.id.desc())
    ).all()


@router.post("/", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    payload: RecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = Record(title=payload.title.strip(), description=payload.description, owner_id=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_owned_record(record_id: int, user_id: int, db: Session) -> Record:
    record = db.scalar(select(Record).where(Record.id == record_id, Record.owner_id == user_id))
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/{record_id}", response_model=RecordResponse)
def get_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_owned_record(record_id, current_user.id, db)


@router.put("/{record_id}", response_model=RecordResponse)
def update_record(
    record_id: int,
    payload: RecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_owned_record(record_id, current_user.id, db)
    record.title = payload.title.strip()
    record.description = payload.description
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
def delete_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = get_owned_record(record_id, current_user.id, db)
    db.delete(record)
    db.commit()
    return None
