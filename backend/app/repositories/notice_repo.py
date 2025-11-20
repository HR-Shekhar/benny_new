# app/repositories/notice_repo.py
from pymongo.collection import Collection
from datetime import datetime
from bson import ObjectId
from typing import List, Optional


class NoticeRepository:
    def __init__(self, db):
        self.collection: Collection = db["notices"]

    async def create_notice(self, faculty_id: str, data: dict) -> dict:
        payload = {
            "faculty_id": ObjectId(faculty_id),
            "title": data["title"],
            "content": data["content"],
            "category": data["category"],
            # store as list or None
            "target_years": data.get("target_years", None),
            "created_at": datetime.utcnow().isoformat()
        }
        res = await self.collection.insert_one(payload)
        new_notice = await self.collection.find_one({"_id": res.inserted_id})
        return self._normalize(new_notice)

    async def get_all(self) -> List[dict]:
        cursor = self.collection.find().sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(doc) for doc in docs]

    async def get_by_faculty(self, faculty_id: str) -> List[dict]:
        cursor = self.collection.find({"faculty_id": ObjectId(faculty_id)}).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(doc) for doc in docs]

    async def get_by_category(self, category: str) -> List[dict]:
        cursor = self.collection.find({"category": category}).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(doc) for doc in docs]

    async def get_by_year(self, year: int) -> List[dict]:
        """
        Return notices that either target all years (target_years == None)
        or explicitly include the given year.
        """
        cursor = self.collection.find({
            "$or": [
                {"target_years": None},
                {"target_years": {"$in": [year]}}
            ]
        }).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(doc) for doc in docs]

    async def get_by_category_and_year(self, category: str, year: int) -> List[dict]:
        cursor = self.collection.find({
            "category": category,
            "$or": [
                {"target_years": None},
                {"target_years": {"$in": [year]}}
            ]
        }).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._normalize(doc) for doc in docs]

    async def delete_notice(self, notice_id: str, faculty_id: str) -> bool:
        result = await self.collection.delete_one({
            "_id": ObjectId(notice_id),
            "faculty_id": ObjectId(faculty_id)
        })
        return result.deleted_count > 0

    def _normalize(self, doc: dict) -> dict:
        return {
            "id": str(doc["_id"]),
            "faculty_id": str(doc["faculty_id"]),
            "title": doc.get("title"),
            "content": doc.get("content"),
            "category": doc.get("category"),
            "target_years": doc.get("target_years"),
            "created_at": doc.get("created_at")
        }
