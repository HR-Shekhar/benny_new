# app/services/notice_service.py
from typing import List
from fastapi import HTTPException, status

from app.repositories.notice_repo import NoticeRepository
from app.schemas.notice import NoticeCreate


class NoticeService:
    def __init__(self, repo: NoticeRepository):
        self.repo = repo

    async def create_notice(self, faculty_id: str, data: NoticeCreate) -> dict:
        # basic validation for target_years
        payload = data.dict()
        target_years = payload.get("target_years")
        if target_years:
            # ensure values are ints between 1 and 6 maybe (but we keep 1-4 typical)
            for y in target_years:
                if not isinstance(y, int) or y < 1 or y > 10:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target_years value")
        return await self.repo.create_notice(faculty_id, payload)

    async def delete_notice(self, notice_id: str, faculty_id: str):
        deleted = await self.repo.delete_notice(notice_id, faculty_id)
        if not deleted:
            raise HTTPException(status_code=403, detail="You can delete only your own notices")
        return {"message": "Notice deleted"}

    async def get_all_notices(self) -> List[dict]:
        return await self.repo.get_all()

    async def get_faculty_notices(self, faculty_id: str) -> List[dict]:
        return await self.repo.get_by_faculty(faculty_id)

    async def get_notices_by_category(self, category: str) -> List[dict]:
        return await self.repo.get_by_category(category)

    async def get_notices_for_year(self, year: int) -> List[dict]:
        return await self.repo.get_by_year(year)

    async def get_notices_by_category_and_year(self, category: str, year: int) -> List[dict]:
        return await self.repo.get_by_category_and_year(category, year)
