import random
from datetime import datetime, timedelta
from fastapi import HTTPException

from app.repositories.otp_repo import OTPRepository
from app.utils.email_sender import send_email
from app.repositories.user_repo import UserRepository


class OTPService:
    def __init__(self, otp_repo: OTPRepository, user_repo: UserRepository):
        self.otp_repo = otp_repo
        self.user_repo = user_repo

    def generate_otp(self) -> str:
        return str(random.randint(100000, 999999))

    async def send_verification_otp(self, email: str):
        otp = self.generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        await self.otp_repo.create_otp(email, otp, expires_at)
        
        # Send email (non-blocking - OTP is saved even if email fails)
        email_sent = send_email(email, f"Your Benny verification OTP is: {otp}")
        if not email_sent:
            # Log warning but don't fail - OTP is still saved in DB
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to send OTP email to {email}, but OTP was saved. OTP: {otp}")

    async def verify_email_otp(self, email: str, otp: str):
        record = await self.otp_repo.get_valid_otp(email, otp)
        if not record:
            raise HTTPException(400, "Invalid or expired OTP")

        await self.otp_repo.mark_used(email, otp)

        # update user
        await self.user_repo.collection.update_one(
            {"email": email},
            {"$set": {"is_email_verified": True}}
        )

        return True
