from fastapi import APIRouter, Depends
from app.core.dependencies import get_user_repo, get_current_user, require_role
from app.repositories.faculty_repo import FacultyRepo
from app.services.faculty_service import FacultyService
from app.schemas.faculty import FacultyProfileCreate, FacultyProfileOut
from app.schemas.user import UserInDB
from app.db.session import get_db
from app.constants.roles import UserRole

router = APIRouter(prefix="/faculty", tags=["faculty"])


# dependency factory
def get_faculty_repo(db=Depends(get_db)):
    return FacultyRepo(db)


def get_faculty_service(repo: FacultyRepo = Depends(get_faculty_repo)):
    return FacultyService(repo)


@router.post("/profile", response_model=FacultyProfileOut, dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def create_update_profile(
    payload: FacultyProfileCreate,
    faculty_service: FacultyService = Depends(get_faculty_service),
    current_user: UserInDB = Depends(get_current_user),
):
    profile = await faculty_service.upsert_profile(current_user, payload)
    return FacultyProfileOut(
        id=profile["id"],
        user_id=profile["user_id"],
        description=profile.get("description"),
        courses=profile.get("courses", []),
        contact=profile.get("contact", {}),
        created_at=profile.get("created_at"),
        updated_at=profile.get("updated_at"),
    )


@router.get("/profile/me", response_model=FacultyProfileOut, dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def get_my_profile(
    faculty_service: FacultyService = Depends(get_faculty_service),
    current_user: UserInDB = Depends(get_current_user),
):
    profile = await faculty_service.get_my_profile(current_user)
    return FacultyProfileOut(
        id=profile["id"],
        user_id=profile["user_id"],
        description=profile.get("description"),
        courses=profile.get("courses", []),
        contact=profile.get("contact", {}),
        created_at=profile.get("created_at"),
        updated_at=profile.get("updated_at"),
    )


@router.get("/profile/{profile_id}", response_model=FacultyProfileOut)
async def get_public_profile(
    profile_id: str,
    faculty_service: FacultyService = Depends(get_faculty_service),
):
    profile = await faculty_service.get_public_profile(profile_id)
    return FacultyProfileOut(
        id=profile["id"],
        user_id=profile["user_id"],
        description=profile.get("description"),
        courses=profile.get("courses", []),
        contact=profile.get("contact", {}),
        created_at=profile.get("created_at"),
        updated_at=profile.get("updated_at"),
    )
