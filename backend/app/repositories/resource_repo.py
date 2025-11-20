from bson import ObjectId
from datetime import datetime

class ResourceRepo:
    def __init__(self, db):
        self.collection = db["resources"]

    async def create(self, data: dict):
        data["created_at"] = datetime.utcnow().isoformat()
        res = await self.collection.insert_one(data)
        doc = await self.collection.find_one({"_id": res.inserted_id})
        return self._normalize(doc)

    async def list_all(self):
        docs = await self.collection.find().sort("created_at", -1).to_list(None)
        return [self._normalize(d) for d in docs]

    async def get(self, resource_id: str):
        doc = await self.collection.find_one({"_id": ObjectId(resource_id)})
        return self._normalize(doc) if doc else None

    def _normalize(self, doc):
        return {
            "id": str(doc["_id"]),
            "title": doc["title"],
            "description": doc.get("description"),
            "course_code": doc["course"]["code"],
            "course_name": doc["course"]["name"],
            "file_path": doc["file_path"],
            "faculty_id": str(doc["faculty_id"]),
            "created_at": doc["created_at"]
        }
