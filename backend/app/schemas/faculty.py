from typing import List, Optional
from pydantic import BaseModel


class CourseItem(BaseModel):
    code: str
    name: str


class ContactInfo(BaseModel):
    phone: Optional[str] = None
    cabin: Optional[str] = None


class FacultyProfileCreate(BaseModel):
    description: Optional[str] = None
    courses: Optional[List[CourseItem]] = []
    contact: Optional[ContactInfo] = None


class FacultyProfileOut(FacultyProfileCreate):
    id: str
    user_id: str
    created_at: str
    updated_at: str
