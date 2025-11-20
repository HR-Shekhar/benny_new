from pydantic import BaseModel
from typing import Optional

class ResourceOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    course_code: str
    course_name: str
    file_path: str
    faculty_id: str
    created_at: str
