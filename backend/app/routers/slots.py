from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.repositories.slot_repo import SlotRepo
from app.services.slot_services import SlotService
from app.schemas.slot import SlotCreate, SlotOut, SlotListItem
from app.core.dependencies import get_current_user, require_role
from app.schemas.user import UserInDB
from app.constants.roles import UserRole
from app.repositories.user_repo import UserRepository


router = APIRouter(prefix="/slots", tags=["Slots"])


def get_slot_service(db=Depends(get_db)):
    repo = SlotRepo(db)
    return SlotService(repo)


# Faculty creates slot
@router.post("/", response_model=SlotOut, dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def create_slot(
    payload: SlotCreate,
    service: SlotService = Depends(get_slot_service),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        created = await service.create_slot(current_user.id, payload)
        # Ensure all required fields are present
        if not created:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Slot creation returned None")
        
        # Validate required fields for SlotOut
        required_fields = ['id', 'faculty_id', 'start_time', 'end_time', 'max_students', 'booked_count', 'booked_by', 'created_at']
        missing_fields = [field for field in required_fields if field not in created]
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Missing required fields in created slot: {missing_fields}"
            )
        
        return SlotOut(**created)
    except HTTPException:
        raise
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        error_trace = traceback.format_exc()
        logger.error(f"Error in create_slot endpoint: {str(e)}\n{error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create slot: {str(e)}"
        )


# IMPORTANT: Specific routes must come BEFORE parameterized routes
# Get all available slots (for students to browse)
@router.get("/available")
async def list_available_slots(
    service: SlotService = Depends(get_slot_service),
    db=Depends(get_db)
):
    try:
        from bson import ObjectId
        repo_user = UserRepository(db)
        
        # get all faculty slots
        slots = await service.repo.collection.find().to_list(length=None)
        
        available_slots = []
        current_time = datetime.utcnow()
        
        for s in slots:
            try:
                booked_count = len(s.get("booked_by", []))
                max_students = s.get("max_students", 0)
                
                # Parse start_time - handle both string and datetime
                start_time_str = s.get("start_time")
                if isinstance(start_time_str, str):
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                    # Make naive if timezone-aware for comparison
                    if start_time.tzinfo:
                        start_time = start_time.replace(tzinfo=None)
                elif isinstance(start_time_str, datetime):
                    start_time = start_time_str
                    if start_time.tzinfo:
                        start_time = start_time.replace(tzinfo=None)
                else:
                    continue
                
                # only available slots (not full and not in the past)
                if booked_count < max_students and start_time > current_time:
                    # faculty_id is stored as ObjectId in the database
                    faculty_id = s.get("faculty_id")
                    if not faculty_id:
                        continue
                    
                    # Ensure faculty_id is ObjectId for query
                    if isinstance(faculty_id, str):
                        faculty_id = ObjectId(faculty_id)
                    
                    faculty_doc = await repo_user.collection.find_one({"_id": faculty_id})
                    if not faculty_doc:
                        continue
                    
                    # normalize faculty info
                    faculty_info = {
                        "id": str(faculty_doc["_id"]),
                        "full_name": faculty_doc.get("full_name"),
                        "email": faculty_doc.get("email"),
                    }
                    
                    available_slots.append({
                        "id": str(s["_id"]),
                        "faculty_id": str(s["faculty_id"]),
                        "title": s.get("title"),
                        "start_time": s.get("start_time"),
                        "end_time": s.get("end_time"),
                        "location": s.get("location"),
                        "max_students": max_students,
                        "booked_count": booked_count,
                        "faculty": faculty_info
                    })
            except Exception as e:
                # Skip slots with errors, log and continue
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Error processing slot {s.get('_id')}: {str(e)}")
                continue
        
        # Sort by start_time
        available_slots.sort(key=lambda x: x["start_time"])
        return available_slots
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Error in list_available_slots: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load available slots: {str(e)}"
        )


# Faculty lists their slots (with bookings)
@router.get("/me", response_model=List[SlotOut], dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def my_slots(
    service: SlotService = Depends(get_slot_service),
    current_user: UserInDB = Depends(get_current_user)
):
    slots = await service.list_slots_for_faculty(current_user.id)
    return [SlotOut(**s) for s in slots]


# Get public slots for a faculty (students use this to list available slots)
@router.get("/faculty/{faculty_id}", response_model=List[SlotListItem])
async def slots_by_faculty(
    faculty_id: str,
    service: SlotService = Depends(get_slot_service)
):
    slots = await service.list_slots_for_faculty(faculty_id)
    # map to list item (hide booked_by)
    return [SlotListItem(
        id=s["id"],
        faculty_id=s["faculty_id"],
        title=s.get("title"),
        start_time=s["start_time"],
        end_time=s["end_time"],
        max_students=s["max_students"],
        location=s.get("location"),
        booked_count=s.get("booked_count", 0)
    ) for s in slots]


# Get a single slot by ID (must come AFTER specific routes)
@router.get("/{slot_id}", response_model=SlotOut)
async def get_slot(
    slot_id: str,
    service: SlotService = Depends(get_slot_service)
):
    slot = await service.get_slot(slot_id)
    return SlotOut(**slot)


# Student books a slot
@router.post("/{slot_id}/book", dependencies=[Depends(require_role([UserRole.STUDENT]))])
async def book_slot(
    slot_id: str,
    service: SlotService = Depends(get_slot_service),
    current_user: UserInDB = Depends(get_current_user)
):
    return await service.book_slot(slot_id, current_user.id)


# Student cancels their booking
@router.post("/{slot_id}/cancel", dependencies=[Depends(require_role([UserRole.STUDENT]))])
async def cancel_booking(
    slot_id: str,
    service: SlotService = Depends(get_slot_service),
    current_user: UserInDB = Depends(get_current_user)
):
    return await service.cancel_booking(slot_id, current_user.id)


# Faculty deletes a slot
@router.delete("/{slot_id}", dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def delete_slot(
    slot_id: str,
    service: SlotService = Depends(get_slot_service),
    current_user: UserInDB = Depends(get_current_user)
):
    return await service.delete_slot(slot_id, current_user.id)
