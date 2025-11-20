from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SlotCreate(BaseModel):
    start_time: datetime = Field(..., description="ISO datetime, UTC recommended")
    end_time: datetime = Field(..., description="ISO datetime, UTC recommended")
    max_students: int = Field(..., gt=0)
    location: Optional[str] = None
    # optional: allow giving a title/purpose
    title: Optional[str] = None


class SlotOut(BaseModel):
    id: str
    faculty_id: str
    title: Optional[str] = None
    start_time: str
    end_time: str
    max_students: int
    location: Optional[str]
    booked_count: int
    booked_by: List[str]
    created_at: str


class SlotListItem(BaseModel):
    id: str
    faculty_id: str
    title: Optional[str] = None
    start_time: str
    end_time: str
    max_students: int
    location: Optional[str]
    booked_count: int
