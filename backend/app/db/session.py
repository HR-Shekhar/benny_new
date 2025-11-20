from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

_client = AsyncIOMotorClient(settings.MONGODB_URI)
_db = _client[settings.MONGODB_DB]


def get_db():
    """
    FastAPI dependency: returns the DB instance.
    """
    return _db
