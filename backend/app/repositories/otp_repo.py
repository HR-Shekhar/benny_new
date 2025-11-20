from datetime import datetime
from pymongo.collection import Collection


class OTPRepository:
    def __init__(self, db):
        self.collection: Collection = db["email_otps"]

    async def create_otp(self, email: str, otp: str, expires_at: datetime):
        data = {
            "email": email,
            "otp": otp,
            "purpose": "email_verification",
            "expires_at": expires_at,
            "is_used": False
        }
        await self.collection.insert_one(data)
        return data

    async def get_valid_otp(self, email: str, otp: str):
        now = datetime.utcnow()
        return await self.collection.find_one({
            "email": email,
            "otp": otp,
            "is_used": False,
            "expires_at": {"$gt": now}
        })

    async def mark_used(self, email: str, otp: str):
        await self.collection.update_one(
            {"email": email, "otp": otp},
            {"$set": {"is_used": True}}
        )
    
    async def get_latest_otp(self, email: str):
        """Get the latest OTP for an email (for testing/debugging)"""
        return await self.collection.find_one(
            {"email": email, "is_used": False},
            sort=[("expires_at", -1)]  # Get most recent
        )