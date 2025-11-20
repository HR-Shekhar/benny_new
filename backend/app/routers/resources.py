from fastapi import APIRouter, UploadFile, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from app.schemas.user import UserInDB
from app.core.dependencies import get_current_user, require_role
from app.constants.roles import UserRole
from app.utils.resource_storage import save_resource_file
from app.utils.pdf_ppt_summarizer import summarize_file
from app.repositories.resource_repo import ResourceRepo
from app.services.resource_service import ResourceService
from app.db.session import get_db
import os

router = APIRouter(prefix="/resources", tags=["Resources"])

def get_service(db=Depends(get_db)):
    repo = ResourceRepo(db)
    return ResourceService(repo)


# Faculty uploads a resource
@router.post("/upload", dependencies=[Depends(require_role([UserRole.FACULTY]))])
async def upload_resource(
    file: UploadFile,
    title: str = Form(...),
    course_code: str = Form(...),
    course_name: str = Form(...),
    description: str = Form(default=""),
    current_user: UserInDB = Depends(get_current_user),
    service: ResourceService = Depends(get_service)
):
    try:
        # Validate file
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Validate file extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ['.pdf', '.ppt', '.pptx']:
            raise HTTPException(status_code=400, detail="Only PDF and PPT/PPTX files are allowed")
        
        path = await save_resource_file(file)

        resource = await service.create_resource(
            faculty_id=current_user.id,
            file_path=path,
            title=title,
            description=description or "",
            course={"code": course_code, "name": course_name}
        )

        return resource
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error uploading resource: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to upload resource: {str(e)}")


# List all resources for students
@router.get("/all")
async def list_resources(service: ResourceService = Depends(get_service)):
    return await service.repo.list_all()


# IMPORTANT: Specific routes must come BEFORE parameterized routes
# Summarize student local file (TEMP upload)
@router.post("/summarize/local")
async def summarize_local_file(
    file: UploadFile,
    summary_type: str = Form("short"),
    service: ResourceService = Depends(get_service)
):
    temp_path = await save_resource_file(file)
    summary = summarize_file(temp_path, summary_type)
    return {"summary": summary}


# Download a resource file (must come before /{resource_id}/summarize)
@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: str,
    service: ResourceService = Depends(get_service)
):
    res = await service.repo.get(resource_id)
    if not res:
        raise HTTPException(404, "Resource not found")
    
    file_path = res["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")
    
    return FileResponse(
        file_path,
        filename=os.path.basename(file_path),
        media_type='application/octet-stream'
    )


# Summarize an uploaded resource
@router.get("/{resource_id}/summarize")
async def summarize_resource(
    resource_id: str,
    summary_type: str = "short",
    service: ResourceService = Depends(get_service)
):
    res = await service.repo.get(resource_id)
    if not res:
        raise HTTPException(404, "Resource not found")

    summary = summarize_file(res["file_path"], summary_type)
    return {"summary": summary}
