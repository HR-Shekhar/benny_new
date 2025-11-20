from pymongo.collection import Collection
from datetime import datetime
from bson import ObjectId
from typing import Optional, List


class SlotRepo:
    def __init__(self, db):
        self.collection: Collection = db["faculty_slots"]

    async def create_slot(self, faculty_id: str, payload: dict) -> dict:
        try:
            # Handle datetime objects - convert to ISO string if needed
            start_time = payload["start_time"]
            end_time = payload["end_time"]
            
            if isinstance(start_time, datetime):
                start_time_str = start_time.isoformat()
            elif isinstance(start_time, str):
                # Validate and use the string as-is (should already be ISO format)
                start_time_str = start_time
            else:
                raise ValueError(f"Invalid start_time type: {type(start_time)}, value: {start_time}")
                
            if isinstance(end_time, datetime):
                end_time_str = end_time.isoformat()
            elif isinstance(end_time, str):
                # Validate and use the string as-is (should already be ISO format)
                end_time_str = end_time
            else:
                raise ValueError(f"Invalid end_time type: {type(end_time)}, value: {end_time}")
            
            # Validate faculty_id is a valid ObjectId
            try:
                faculty_obj_id = ObjectId(faculty_id)
            except Exception as e:
                raise ValueError(f"Invalid faculty_id format: {faculty_id}, error: {str(e)}")
            
            doc = {
                "faculty_id": faculty_obj_id,
                "title": payload.get("title"),
                "start_time": start_time_str,
                "end_time": end_time_str,
                "max_students": int(payload["max_students"]),
                "location": payload.get("location"),
                "booked_by": [],  # list of ObjectId strings
                "created_at": datetime.utcnow().isoformat(),
            }
            res = await self.collection.insert_one(doc)
            created = await self.collection.find_one({"_id": res.inserted_id})
            if not created:
                raise ValueError("Failed to retrieve created slot")
            return self._normalize(created)
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating slot: {str(e)}, payload: {payload}, faculty_id: {faculty_id}")
            raise

    async def get_slots_by_faculty(self, faculty_id: str) -> List[dict]:
        cursor = self.collection.find({"faculty_id": ObjectId(faculty_id)}).sort("start_time", 1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(d) for d in docs]

    async def get_slot_by_id(self, slot_id: str) -> Optional[dict]:
        doc = await self.collection.find_one({"_id": ObjectId(slot_id)})
        return self._normalize(doc) if doc else None

    async def delete_slot(self, slot_id: str, faculty_id: str) -> bool:
        res = await self.collection.delete_one({
            "_id": ObjectId(slot_id),
            "faculty_id": ObjectId(faculty_id)
        })
        return res.deleted_count > 0

    async def book_slot(self, slot_id: str, student_id: str) -> bool:
        """
        Attempt to push student into booked_by if room available and not already booked.
        Returns True if booked, False if already booked or full.
        """
        # ensure not already booked
        doc = await self.collection.find_one({"_id": ObjectId(slot_id)})
        if not doc:
            return False
        booked = [str(x) for x in doc.get("booked_by", [])]
        if student_id in booked:
            return False
        if len(booked) >= int(doc.get("max_students", 0)):
            return False

        await self.collection.update_one(
            {"_id": ObjectId(slot_id)},
            {"$push": {"booked_by": ObjectId(student_id)}}
        )
        return True

    async def cancel_booking(self, slot_id: str, student_id: str) -> bool:
        res = await self.collection.update_one(
            {"_id": ObjectId(slot_id)},
            {"$pull": {"booked_by": ObjectId(student_id)}}
        )
        return res.modified_count > 0

    def _normalize(self, doc: dict) -> dict:
        if not doc:
            raise ValueError("Cannot normalize None or empty document")
        return {
            "id": str(doc["_id"]),
            "faculty_id": str(doc["faculty_id"]),
            "title": doc.get("title"),
            "start_time": str(doc.get("start_time", "")),
            "end_time": str(doc.get("end_time", "")),
            "max_students": int(doc.get("max_students", 0)),
            "location": doc.get("location"),
            "booked_by": [str(x) for x in doc.get("booked_by", [])],
            "booked_count": len(doc.get("booked_by", [])),
            "created_at": str(doc.get("created_at", "")),
        }
