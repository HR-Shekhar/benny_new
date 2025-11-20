from typing import Optional

from bson import ObjectId
from pymongo.collection import Collection


class UserRepository:
    def __init__(self, db):
        self.collection: Collection = db["users"]

    async def get_by_email(self, email: str) -> Optional[dict]:
        return await self.collection.find_one({"email": email})

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def create(self, user_data: dict) -> dict:
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data
