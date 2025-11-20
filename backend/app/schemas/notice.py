# app/schemas/notice.py
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class NoticeCategory(str, Enum):
    school_of_cset = "school_of_cset"
    school_of_law = "school_of_law"
    school_of_ai = "school_of_ai"
    school_of_media = "school_of_media"
    school_of_management = "school_of_management"
    cabinet = "cabinet"
    clubs_and_chapters = "clubs_and_chapters"
    faculty = "faculty"


class NoticeCreate(BaseModel):
    title: str
    content: str
    category: NoticeCategory
    # target_years: None => visible to all years. Otherwise list of ints: [1,2,3,4]
    target_years: Optional[List[int]] = None


class NoticeOut(BaseModel):
    id: str
    faculty_id: str
    title: str
    content: str
    category: NoticeCategory
    target_years: Optional[List[int]] = None
    created_at: str
