from datetime import datetime
from typing import Optional
from pymongo.collection import Collection
from bson import ObjectId


class FacultyRepo:
    def __init__(self, db):
        self.collection: Collection = db["faculty_profiles"]

    async def get_by_user_id(self, user_id: str) -> Optional[dict]:
        return await self.collection.find_one({"user_id": ObjectId(user_id)})

    async def get_by_id(self, profile_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(profile_id)})

    async def create_or_update(self, user_id: str, payload: dict) -> dict:
        now = datetime.utcnow().isoformat()
        payload_db = {
            "user_id": ObjectId(user_id),
            "description": payload.get("description"),
            "courses": payload.get("courses", []),
            "contact": payload.get("contact", {}),
            "updated_at": now,
        }
        existing = await self.get_by_user_id(user_id)
        if existing:
            await self.collection.update_one(
                {"_id": existing["_id"]},
                {"$set": payload_db}
            )
            updated = await self.get_by_id(str(existing["_id"]))
            return updated
        else:
            payload_db["created_at"] = now
            res = await self.collection.insert_one(payload_db)
            created = await self.get_by_id(str(res.inserted_id))
            return created

    async def public_view(self, profile_id: str) -> Optional[dict]:
        # Return public-safe fields
        doc = await self.get_by_id(profile_id)
        if not doc:
            return None
        return {
            "id": str(doc["_id"]),
            "user_id": str(doc["user_id"]),
            "description": doc.get("description"),
            "courses": doc.get("courses", []),
            "contact": doc.get("contact", {}),
            "created_at": doc.get("created_at"),
            "updated_at": doc.get("updated_at"),
        }
