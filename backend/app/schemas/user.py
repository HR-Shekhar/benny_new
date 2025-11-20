from typing import Optional
from pydantic import BaseModel, EmailStr
from app.constants.roles import UserRole


# ---------- Core user schemas ----------

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole


class UserCreateStudent(UserCreate):
    role: UserRole = UserRole.STUDENT


class UserCreateFaculty(UserCreate):
    role: UserRole = UserRole.FACULTY


class UserCreateAlumni(UserCreate):
    role: UserRole = UserRole.ALUMNI


class UserInDB(UserBase):
    id: str
    role: UserRole
    is_email_verified: bool = True  # we will hook OTP later


class UserOut(UserBase):
    id: str
    role: UserRole
    is_email_verified: bool


# ---------- Auth schemas ----------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class OTPRequest(BaseModel):
    email: EmailStr