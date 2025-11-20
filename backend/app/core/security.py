from datetime import datetime, timedelta
from typing import Optional
import hashlib

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _prehash_password(password: str) -> str:
    """
    Pre-hash password with SHA-256 to handle bcrypt's 72-byte limit.
    This allows passwords longer than 72 bytes to be hashed securely.
    """
    # Encode password to bytes
    password_bytes = password.encode('utf-8')
    
    # If password is already <= 72 bytes, return as-is
    if len(password_bytes) <= 72:
        return password
    
    # Pre-hash with SHA-256 for longer passwords
    sha256_hash = hashlib.sha256(password_bytes).hexdigest()
    return sha256_hash


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    Handles both regular passwords and pre-hashed passwords.
    """
    # Pre-hash if password is longer than 72 bytes (same as in get_password_hash)
    password_to_verify = _prehash_password(plain_password)
    return pwd_context.verify(password_to_verify, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Automatically handles passwords longer than 72 bytes by pre-hashing.
    """
    # Pre-hash if password is longer than 72 bytes
    password_to_hash = _prehash_password(password)
    return pwd_context.hash(password_to_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    ))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise
