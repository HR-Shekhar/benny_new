# app/routers/notices.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from app.core.dependencies import get_current_user, require_role, get_user_repo
from app.constants.roles import UserRole
from app.schemas.notice import NoticeCreate, NoticeOut, NoticeCategory
from app.repositories.notice_repo import NoticeRepository
from app.services.notice_service import NoticeService
from app.schemas.user import UserInDB
from app.db.session import get_db

router = APIRouter(prefix="/notices", tags=["Notices"])


def get_notice_service(db=Depends(get_db)):
    repo = NoticeRepository(db)
    return NoticeService(repo)


# Helper: derive student year from Bennett email like s24cse...
def extract_student_year_from_email(email: str) -> int:
    """
    Example email: s24cseu123@bennett.edu.in
    Extract '24' -> full year 2024 -> compute student year relative to current year.
    Returns an integer >= 1. Raises HTTPException if pattern is not recognized.
    """
    try:
        # naive but effective: letters then two digits after initial 's' or 'S'
        lower = email.lower()
        idx = lower.find("@")
        local = lower if idx == -1 else lower[:idx]
        # find first occurrence of 's' followed by two digits
        import re
        m = re.search(r"s(\d{2})", local)
        if not m:
            raise ValueError("Admission year not found in email")
        yy = int(m.group(1))
        full_adm_year = 2000 + yy
        current_year = datetime.utcnow().year
        student_year = current_year - full_adm_year + 1
        if student_year < 1:
            student_year = 1
        return student_year
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot extract student year from email")


# 1. Faculty creates notice (must include category; optional target_years)
@router.post("/", dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def create_notice(
    data: NoticeCreate,
    service: NoticeService = Depends(get_notice_service),
    current_user: UserInDB = Depends(get_current_user)
):
    notice = await service.create_notice(current_user.id, data)
    return notice


# 2. Everyone can see all notices (unfiltered)
@router.get("/all", response_model=list[NoticeOut])
async def get_all_notices(service: NoticeService = Depends(get_notice_service)):
    return await service.get_all_notices()


# 3. Get notices by a specific faculty
@router.get("/faculty/{faculty_id}", response_model=list[NoticeOut])
async def get_faculty_notices(
    faculty_id: str,
    service: NoticeService = Depends(get_notice_service)
):
    return await service.get_faculty_notices(faculty_id)


# 4. Get notices by category (unfiltered by year)
@router.get("/category/{category}", response_model=list[NoticeOut])
async def get_notices_by_category(
    category: NoticeCategory,
    service: NoticeService = Depends(get_notice_service)
):
    return await service.get_notices_by_category(category.value)


# 5. Get notices by category + year (e.g. show CSET notices for 1st year)
@router.get("/category/{category}/year/{year}", response_model=list[NoticeOut])
async def get_notices_by_category_and_year(
    category: NoticeCategory,
    year: int,
    service: NoticeService = Depends(get_notice_service)
):
    return await service.get_notices_by_category_and_year(category.value, year)


# 6. Student feed — notices relevant to the current student's computed year
@router.get("/student-feed", response_model=list[NoticeOut])
async def get_student_feed(
    current_user: UserInDB = Depends(get_current_user),
    service: NoticeService = Depends(get_notice_service)
):
    # only students expected here; but allow others to see general feed (optional)
    try:
        student_year = extract_student_year_from_email(current_user.email)
    except HTTPException:
        # if we can't find student year, return general feed (all notices)
        return await service.get_all_notices()

    # return notices targeted to their year (or global)
    return await service.get_notices_for_year(student_year)


# 7. Faculty deletes own notice
@router.delete("/{notice_id}", dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def delete_notice(
    notice_id: str,
    service: NoticeService = Depends(get_notice_service),
    current_user: UserInDB = Depends(get_current_user)
):
    return await service.delete_notice(notice_id, current_user.id)
