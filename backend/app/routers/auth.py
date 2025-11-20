from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.dependencies import get_user_repo, get_current_user, require_role
from app.db.session import get_db
from app.repositories.user_repo import UserRepository
from app.repositories.otp_repo import OTPRepository
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.schemas.user import (
    UserCreateStudent,
    UserCreateFaculty,
    UserCreateAlumni,
    UserOut,
    Token,
)
from app.schemas.user import LoginRequest, UserInDB, OTPVerifyRequest, OTPRequest
from app.constants.roles import UserRole

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)


# ---------- Registration endpoints ----------

@router.post("/register/student", response_model=UserOut)
async def register_student(
    data: UserCreateStudent,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.register_student(data)
    return user


@router.post("/register/faculty", response_model=UserOut)
async def register_faculty(
    data: UserCreateFaculty,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.register_faculty(data)
    return user


@router.post("/register/alumni", response_model=UserOut)
async def register_alumni(
    data: UserCreateAlumni,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.register_alumni(data)
    return user


# ---------- Login ----------

# If using OAuth2PasswordRequestForm, frontend sends form-data
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.authenticate_user(
        email=form_data.username, password=form_data.password
    )
    access_token = auth_service.create_access_token_for_user(user)
    return Token(access_token=access_token)


# ---------- Sample protected routes ----------

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user


@router.get("/faculty-only")
async def faculty_only(
    current_user: UserInDB = Depends(require_role([UserRole.FACULTY])),
):
    return {"message": f"Hello, {current_user.full_name or current_user.email}. Faculty zone."}


@router.get("/student-only")
async def student_only(
    current_user: UserInDB = Depends(require_role([UserRole.STUDENT])),
):
    return {"message": "Hello student."}


# ---------- OTP Verification ----------

@router.post("/request-otp")
async def request_otp(
    data: OTPRequest,
    user_repo: UserRepository = Depends(get_user_repo),
):
    """
    Request/resend OTP for email verification.
    User must be registered first.
    """
    # Check if user exists
    user = await user_repo.get_by_email(data.email)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found. Please register first."
        )
    
    # Check if already verified
    if user.get("is_email_verified", False):
        return {
            "message": "Email is already verified",
            "email": data.email,
            "verified": True
        }
    
    # Send OTP
    db = get_db()
    otp_repo = OTPRepository(db)
    otp_service = OTPService(otp_repo, user_repo)
    await otp_service.send_verification_otp(data.email)
    
    return {
        "message": "OTP sent successfully. Please check your email.",
        "email": data.email
    }


@router.post("/verify-email")
async def verify_email_otp(
    data: OTPVerifyRequest,
    user_repo: UserRepository = Depends(get_user_repo),
):
    """Verify email with OTP"""
    db = get_db()
    otp_repo = OTPRepository(db)
    otp_service = OTPService(otp_repo, user_repo)
    
    result = await otp_service.verify_email_otp(data.email, data.otp)
    return {"message": "Email verified successfully", "verified": result}


@router.get("/otp/{email}")
async def get_latest_otp(
    email: str,
    user_repo: UserRepository = Depends(get_user_repo),
):
    """
    Get the latest OTP for an email (for testing/debugging only).
    WARNING: Remove this endpoint in production!
    """
    db = get_db()
    otp_repo = OTPRepository(db)
    otp_record = await otp_repo.get_latest_otp(email)
    
    if not otp_record:
        return {"message": "No valid OTP found for this email"}
    
    from datetime import datetime
    is_expired = otp_record["expires_at"] < datetime.utcnow()
    
    return {
        "email": email,
        "otp": otp_record["otp"],
        "expires_at": otp_record["expires_at"].isoformat(),
        "is_expired": is_expired,
        "is_used": otp_record["is_used"],
        "message": "WARNING: This endpoint should be removed in production!"
    }

