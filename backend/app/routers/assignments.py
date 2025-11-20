"""
Assignment Router
Handles all assignment and submission endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
import os

from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentOut,
    SubmissionOut,
    AssignmentListResponse,
    SubmissionListResponse
)
from app.schemas.user import UserInDB
from app.core.dependencies import get_current_user, require_role
from app.constants.roles import UserRole
from app.services.assignment_service import AssignmentService
from app.utils.assignment_storage import (
    save_assignment_file,
    save_submission_file,
    get_file_content_type
)

router = APIRouter(prefix="/assignments", tags=["Assignments"])


def get_service() -> AssignmentService:
    """Dependency to get assignment service."""
    return AssignmentService()


# ========== Assignment Endpoints ==========

@router.post("/", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    deadline: str = Form(...),  # ISO format datetime string
    files: List[UploadFile] = File(default=[]),
    current_user: UserInDB = Depends(require_role([UserRole.FACULTY])),
    service: AssignmentService = Depends(get_service)
):
    """
    Create a new assignment (Faculty only).
    Supports uploading multiple files of any type.
    """
    try:
        # Parse deadline
        deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        
        # Create assignment
        assignment = await service.create_assignment(
            faculty_id=current_user.id,
            title=title,
            description=description,
            deadline=deadline_dt
        )
        
        # Save uploaded files
        saved_files = []
        for file in files:
            if file.filename:
                file_path, original_filename, file_size = await save_assignment_file(
                    file, assignment['id']
                )
                await service.add_assignment_file(
                    assignment['id'],
                    file_path,
                    original_filename,
                    file_size
                )
                saved_files.append({
                    'filename': original_filename,
                    'file_path': file_path,
                    'file_size': file_size,
                    'content_type': get_file_content_type(original_filename)
                })
        
        # Update assignment with files
        assignment['files'] = saved_files
        
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create assignment: {str(e)}")


@router.get("/", response_model=AssignmentListResponse)
async def list_assignments(
    service: AssignmentService = Depends(get_service)
):
    """
    List all assignments (available to all authenticated users).
    """
    try:
        assignments = await service.list_assignments()
        return {
            'assignments': assignments,
            'total': len(assignments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list assignments: {str(e)}")


@router.get("/{assignment_id}", response_model=AssignmentOut)
async def get_assignment(
    assignment_id: str,
    service: AssignmentService = Depends(get_service)
):
    """
    Get assignment details by ID.
    """
    assignment = await service.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.get("/{assignment_id}/files/{filename:path}")
async def download_assignment_file(
    assignment_id: str,
    filename: str,
    service: AssignmentService = Depends(get_service)
):
    """
    Download an assignment file.
    """
    assignment = await service.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Find the file
    file_info = None
    for f in assignment.get('files', []):
        if filename in f.get('file_path', '') or filename == f.get('filename', ''):
            file_info = f
            break
    
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = file_info['file_path']
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        file_path,
        filename=file_info['filename'],
        media_type=file_info.get('content_type', 'application/octet-stream')
    )


# ========== Submission Endpoints ==========

@router.post("/{assignment_id}/submit", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def submit_assignment(
    assignment_id: str,
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(require_role([UserRole.STUDENT])),
    service: AssignmentService = Depends(get_service)
):
    """
    Submit an assignment (Student only).
    Supports any file type.
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save submission file
        file_path, original_filename, file_size = await save_submission_file(
            file, assignment_id, current_user.id
        )
        
        # Create submission
        submission = await service.create_submission(
            assignment_id=assignment_id,
            student_id=current_user.id,
            file_path=file_path,
            filename=original_filename,
            file_size=file_size
        )
        
        # Auto-grade the submission immediately
        try:
            submission = await service.grade_submission(submission['id'])
        except Exception as grade_error:
            # If grading fails, still return the submission
            print(f"Auto-grading failed: {grade_error}")
        
        return submission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit assignment: {str(e)}")


@router.get("/{assignment_id}/my-submission")
async def get_my_submission(
    assignment_id: str,
    current_user: UserInDB = Depends(require_role([UserRole.STUDENT])),
    service: AssignmentService = Depends(get_service)
):
    """
    Get a student's own submission for an assignment (Student only).
    """
    try:
        submission = await service.submission_repo.get_by_student_and_assignment(
            current_user.id, assignment_id
        )
        if not submission:
            raise HTTPException(status_code=404, detail="No submission found for this assignment")
        return submission
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get submission: {str(e)}")


@router.get("/{assignment_id}/submissions", response_model=SubmissionListResponse)
async def list_submissions(
    assignment_id: str,
    current_user: UserInDB = Depends(require_role([UserRole.FACULTY])),
    service: AssignmentService = Depends(get_service)
):
    """
    List all submissions for an assignment (Faculty only).
    """
    try:
        # Verify assignment exists
        assignment = await service.get_assignment(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Verify faculty owns the assignment
        if assignment.get('created_by') != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view submissions for this assignment")
        
        submissions = await service.get_submissions(assignment_id)
        return {
            'submissions': submissions,
            'total': len(submissions)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list submissions: {str(e)}")


@router.get("/{assignment_id}/submissions/{submission_id}", response_model=SubmissionOut)
async def get_submission(
    assignment_id: str,
    submission_id: str,
    current_user: UserInDB = Depends(get_current_user),
    service: AssignmentService = Depends(get_service)
):
    """
    Get a specific submission with AI feedback and grade.
    Faculty can view any submission for their assignments.
    Students can only view their own submissions.
    """
    try:
        submission = await service.get_submission(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Verify assignment exists
        assignment = await service.get_assignment(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Authorization check
        is_faculty = current_user.role == UserRole.FACULTY
        is_owner = assignment.get('created_by') == current_user.id
        is_student_owner = submission.get('student_id') == current_user.id
        
        if not (is_faculty and is_owner) and not is_student_owner:
            raise HTTPException(status_code=403, detail="Not authorized to view this submission")
        
        # Auto-grade if not graded yet (for both faculty and students)
        if not submission.get('grade'):
            try:
                submission = await service.grade_submission(submission_id)
            except Exception as grade_error:
                # If grading fails, still return the submission
                print(f"Auto-grading failed: {grade_error}")
        
        return submission
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get submission: {str(e)}")


@router.post("/{assignment_id}/submissions/{submission_id}/grade")
async def grade_submission(
    assignment_id: str,
    submission_id: str,
    current_user: UserInDB = Depends(require_role([UserRole.FACULTY])),
    service: AssignmentService = Depends(get_service)
):
    """
    Manually trigger AI grading for a submission (Faculty only).
    """
    try:
        submission = await service.get_submission(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        assignment = await service.get_assignment(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        if assignment.get('created_by') != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to grade this submission")
        
        graded_submission = await service.grade_submission(submission_id)
        return graded_submission
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to grade submission: {str(e)}")


@router.get("/{assignment_id}/submissions/{submission_id}/download")
async def download_submission_file(
    assignment_id: str,
    submission_id: str,
    current_user: UserInDB = Depends(get_current_user),
    service: AssignmentService = Depends(get_service)
):
    """
    Download a submission file.
    Faculty can download any submission for their assignments.
    Students can only download their own submissions.
    """
    try:
        submission = await service.get_submission(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        assignment = await service.get_assignment(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Authorization check
        is_faculty = current_user.role == UserRole.FACULTY
        is_owner = assignment.get('created_by') == current_user.id
        is_student_owner = submission.get('student_id') == current_user.id
        
        if not (is_faculty and is_owner) and not is_student_owner:
            raise HTTPException(status_code=403, detail="Not authorized to download this file")
        
        file_info = submission.get('file')
        if not file_info:
            raise HTTPException(status_code=404, detail="No file in submission")
        
        file_path = file_info['file_path']
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server")
        
        return FileResponse(
            file_path,
            filename=file_info['filename'],
            media_type=file_info.get('content_type', 'application/octet-stream')
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

