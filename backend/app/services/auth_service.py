from datetime import timedelta
from typing import Union

from fastapi import HTTPException, status

from app.repositories.user_repo import UserRepository
from app.repositories.otp_repo import OTPRepository
from app.services.otp_service import OTPService
from app.db.session import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.schemas.user import (
    UserCreateStudent,
    UserCreateFaculty,
    UserCreateAlumni,
    UserInDB,
)
from app.constants.roles import UserRole
from app.core.config import settings


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    # ---------- Registration ----------

    async def register_student(self, data: UserCreateStudent) -> UserInDB:
        if not data.email.endswith("@bennett.edu.in"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student email must be @bennett.edu.in",
            )

        return await self._register_user(data, role=UserRole.STUDENT)

    async def register_faculty(self, data: UserCreateFaculty) -> UserInDB:
        return await self._register_user(data, role=UserRole.FACULTY)

    async def register_alumni(self, data: UserCreateAlumni) -> UserInDB:
        return await self._register_user(data, role=UserRole.ALUMNI)

    async def _register_user(
        self,
        data: Union[UserCreateStudent, UserCreateFaculty, UserCreateAlumni],
        role: UserRole,
    ) -> UserInDB:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        hashed_password = get_password_hash(data.password)

        requires_verification = role == UserRole.STUDENT

        user_doc = {
            "email": data.email,
            "full_name": data.full_name,
            "hashed_password": hashed_password,
            "role": role.value,
            # Only students require email verification via OTP
            "is_email_verified": not requires_verification,
        }

        created = await self.user_repo.create(user_doc)

        # Only trigger OTP flow for students (faculty/alumni are auto-verified for now)
        if requires_verification:
            # Send OTP for email verification (non-blocking - user is created even if email fails)
            try:
                db = get_db()
                otp_repo = OTPRepository(db)
                otp_service = OTPService(otp_repo, self.user_repo)
                await otp_service.send_verification_otp(data.email)
            except Exception as e:
                # Log error but don't fail registration
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send OTP email during registration: {e}")

        return UserInDB(
            id=str(created["_id"]),
            email=created["email"],
            full_name=created.get("full_name"),
            role=role,
            is_email_verified=created["is_email_verified"],
        )

    # ---------- Login ----------

    async def authenticate_user(self, email: str, password: str) -> UserInDB:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        return UserInDB(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user.get("full_name"),
            role=UserRole(user["role"]),
            is_email_verified=user.get("is_email_verified", True),
        )

    def create_access_token_for_user(self, user: UserInDB) -> str:
        access_token_expires = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        token_data = {"sub": user.id, "role": user.role.value}
        return create_access_token(
            data=token_data, expires_delta=access_token_expires
        )
