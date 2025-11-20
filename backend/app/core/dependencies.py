from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from bson import ObjectId

from app.db.session import get_db
from app.repositories.user_repo import UserRepository
from app.core.security import decode_access_token
from app.schemas.user import UserInDB
from app.constants.roles import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_repo(db=Depends(get_db)) -> UserRepository:
    return UserRepository(db)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(get_user_repo),
) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    raw_user = await user_repo.get_by_id(user_id)
    if not raw_user:
        raise credentials_exception

    return UserInDB(
        id=str(raw_user["_id"]),
        email=raw_user["email"],
        full_name=raw_user.get("full_name"),
        role=UserRole(raw_user["role"]),
        is_email_verified=raw_user.get("is_email_verified", True),
    )


def require_role(allowed_roles: list[UserRole]):
    async def role_checker(current_user: UserInDB = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
