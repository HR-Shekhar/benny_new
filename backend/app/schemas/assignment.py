from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class AssignmentStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    DRAFT = "draft"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    GRADED = "graded"
    LATE = "late"


# Assignment Schemas
class AssignmentFile(BaseModel):
    filename: str
    file_path: str
    file_size: int
    content_type: str


class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    deadline: datetime


class AssignmentOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    deadline: datetime
    created_at: datetime
    created_by: str  # faculty_id
    status: AssignmentStatus
    files: List[AssignmentFile] = []

    class Config:
        from_attributes = True


# Submission Schemas
class SubmissionCreate(BaseModel):
    assignment_id: str


class SubmissionFile(BaseModel):
    filename: str
    file_path: str
    file_size: int
    content_type: str
    uploaded_at: datetime


class GradeResult(BaseModel):
    score: float = Field(..., ge=0, le=100)
    feedback: str
    graded_at: datetime
    graded_by: str = "ai"  # For now, always AI


class SubmissionOut(BaseModel):
    id: str
    assignment_id: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    file: Optional[SubmissionFile] = None
    submitted_at: Optional[datetime] = None
    status: SubmissionStatus
    grade: Optional[GradeResult] = None
    is_late: bool = False

    class Config:
        from_attributes = True


class SubmissionWithAssignment(SubmissionOut):
    assignment: AssignmentOut


# Response schemas
class AssignmentListResponse(BaseModel):
    assignments: List[AssignmentOut]
    total: int


class SubmissionListResponse(BaseModel):
    submissions: List[SubmissionOut]
    total: int

