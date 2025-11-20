from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status

from app.repositories.slot_repo import SlotRepo
from app.schemas.slot import SlotCreate


class SlotService:
    def __init__(self, repo: SlotRepo):
        self.repo = repo

    async def create_slot(self, faculty_id: str, payload: SlotCreate) -> dict:
        # validations
        if payload.end_time <= payload.start_time:
            raise HTTPException(status_code=400, detail="end_time must be after start_time")
        # optional: prevent creating slot in the past
        # Handle timezone-aware datetimes from frontend
        now_utc = datetime.now(timezone.utc)
        end_time = payload.end_time
        
        # Convert to UTC-aware datetime for comparison
        if end_time.tzinfo is None:
            # If naive, assume it's UTC
            end_time_utc = end_time.replace(tzinfo=timezone.utc)
        else:
            # If aware, convert to UTC
            end_time_utc = end_time.astimezone(timezone.utc)
        
        if end_time_utc <= now_utc:
            raise HTTPException(status_code=400, detail="Cannot create a slot that ends in the past")
        
        # Convert Pydantic model to dict with datetime objects preserved
        # Pydantic will keep datetime as datetime objects in the dict
        try:
            # Try Pydantic v2 method first
            if hasattr(payload, 'model_dump'):
                payload_dict = payload.model_dump()
            else:
                # Pydantic v1
                payload_dict = payload.dict()
        except Exception as e:
            # Fallback: manually construct dict
            payload_dict = {
                "start_time": payload.start_time,
                "end_time": payload.end_time,
                "max_students": payload.max_students,
                "title": payload.title,
                "location": payload.location,
            }
        
        return await self.repo.create_slot(faculty_id, payload_dict)

    async def list_slots_for_faculty(self, faculty_id: str) -> List[dict]:
        return await self.repo.get_slots_by_faculty(faculty_id)

    async def get_slot(self, slot_id: str) -> dict:
        slot = await self.repo.get_slot_by_id(slot_id)
        if not slot:
            raise HTTPException(status_code=404, detail="Slot not found")
        return slot

    async def delete_slot(self, slot_id: str, faculty_id: str):
        ok = await self.repo.delete_slot(slot_id, faculty_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Cannot delete slot: not found or not your slot")
        return {"message": "Slot deleted"}

    async def book_slot(self, slot_id: str, student_id: str):
        slot = await self.repo.get_slot_by_id(slot_id)
        if not slot:
            raise HTTPException(status_code=404, detail="Slot not found")
        # prevent booking past start time
        start_time = datetime.fromisoformat(slot["start_time"])
        end_time = datetime.fromisoformat(slot["end_time"])
        if datetime.utcnow() >= end_time:
            raise HTTPException(status_code=400, detail="Cannot book a slot that has ended")
        # attempt booking
        booked = await self.repo.book_slot(slot_id, student_id)
        if not booked:
            # determine reason
            if student_id in slot["booked_by"]:
                raise HTTPException(status_code=400, detail="You have already booked this slot")
            if slot["booked_count"] >= slot["max_students"]:
                raise HTTPException(status_code=400, detail="Slot is full")
            raise HTTPException(status_code=400, detail="Unable to book slot")
        return {"message": "Booked successfully"}

    async def cancel_booking(self, slot_id: str, student_id: str):
        ok = await self.repo.cancel_booking(slot_id, student_id)
        if not ok:
            raise HTTPException(status_code=400, detail="You do not have a booking on this slot")
        return {"message": "Booking cancelled"}
