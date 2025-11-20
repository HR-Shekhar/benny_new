from fastapi import HTTPException, status

from app.repositories.faculty_repo import FacultyRepo
from app.schemas.faculty import FacultyProfileCreate
from app.schemas.user import UserInDB


class FacultyService:
    def __init__(self, repo: FacultyRepo):
        self.repo = repo

    async def upsert_profile(self, current_user: UserInDB, payload: FacultyProfileCreate):
        if current_user.role.value != "faculty":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only faculty can create/update profile.")
        data = payload.dict()
        created = await self.repo.create_or_update(current_user.id, data)
        if not created:
            raise HTTPException(status_code=500, detail="Could not create profile")
        # normalize response id fields
        created["id"] = str(created["_id"])
        created["user_id"] = str(created["user_id"])
        return created

    async def get_my_profile(self, current_user: UserInDB):
        if current_user.role.value != "faculty":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only faculty have profiles.")
        profile = await self.repo.get_by_user_id(current_user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        profile["id"] = str(profile["_id"])
        profile["user_id"] = str(profile["user_id"])
        return profile

    async def get_public_profile(self, profile_id: str):
        profile = await self.repo.public_view(profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
