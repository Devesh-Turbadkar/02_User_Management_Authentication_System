from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class RecordCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=5000)


class RecordUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=5000)


class RecordResponse(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
