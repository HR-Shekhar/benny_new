"""
Service layer for assignment operations.
Contains business logic and orchestrates repository and AI grading.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.repositories.assignment_repo import AssignmentRepository, SubmissionRepository
from app.services.ai_grading_service import AIGradingService
from app.utils.assignment_storage import get_file_content_type


class AssignmentService:
    """Service for assignment management."""
    
    def __init__(self):
        self.assignment_repo = AssignmentRepository()
        self.submission_repo = SubmissionRepository()
        self.ai_grading = AIGradingService()
    
    async def create_assignment(
        self,
        faculty_id: str,
        title: str,
        description: Optional[str],
        deadline: datetime,
        files: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new assignment."""
        # Ensure deadline is timezone-aware (UTC)
        if deadline.tzinfo is None:
            deadline_utc = deadline.replace(tzinfo=timezone.utc)
        else:
            deadline_utc = deadline.astimezone(timezone.utc)
        
        assignment_data = {
            'title': title,
            'description': description or '',
            'deadline': deadline_utc.isoformat(),
            'created_by': faculty_id,
            'status': 'active',
            'files': files or []
        }
        return await self.assignment_repo.create(assignment_data)
    
    async def get_assignment(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get an assignment by ID."""
        return await self.assignment_repo.get(assignment_id)
    
    async def list_assignments(self) -> List[Dict[str, Any]]:
        """List all assignments."""
        assignments = await self.assignment_repo.list_all()
        # Sort by created_at descending
        assignments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return assignments
    
    async def add_assignment_file(
        self,
        assignment_id: str,
        file_path: str,
        filename: str,
        file_size: int
    ) -> Optional[Dict[str, Any]]:
        """Add a file to an assignment."""
        file_data = {
            'filename': filename,
            'file_path': file_path,
            'file_size': file_size,
            'content_type': get_file_content_type(filename)
        }
        return await self.assignment_repo.add_file(assignment_id, file_data)
    
    async def create_submission(
        self,
        assignment_id: str,
        student_id: str,
        file_path: str,
        filename: str,
        file_size: int
    ) -> Dict[str, Any]:
        """Create a new submission."""
        # Check if assignment exists
        assignment = await self.assignment_repo.get(assignment_id)
        if not assignment:
            raise ValueError("Assignment not found")
        
        # Check if student already submitted
        existing = await self.submission_repo.get_by_student_and_assignment(
            student_id, assignment_id
        )
        
        # Check if late - handle timezone-aware and naive datetimes
        deadline_str = assignment['deadline']
        if isinstance(deadline_str, str):
            deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
        else:
            deadline = deadline_str
        
        # Ensure deadline is timezone-aware (convert to UTC if needed)
        if deadline.tzinfo is None:
            # If naive, assume it's UTC
            deadline_utc = deadline.replace(tzinfo=timezone.utc)
        else:
            # If aware, convert to UTC
            deadline_utc = deadline.astimezone(timezone.utc)
        
        # Use timezone-aware current time
        now_utc = datetime.now(timezone.utc)
        is_late = now_utc > deadline_utc
        
        submission_data = {
            'assignment_id': assignment_id,
            'student_id': student_id,
            'file': {
                'filename': filename,
                'file_path': file_path,
                'file_size': file_size,
                'content_type': get_file_content_type(filename),
                'uploaded_at': datetime.now(timezone.utc).isoformat()
            },
            'status': 'pending',
            'is_late': is_late
        }
        
        # If updating existing submission
        if existing:
            submission_data['id'] = existing['id']
            return await self.submission_repo.update(existing['id'], submission_data)
        
        return await self.submission_repo.create(submission_data)
    
    async def get_submissions(self, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all submissions for an assignment."""
        submissions = await self.submission_repo.get_by_assignment(assignment_id)
        
        # Enrich with student information (would need user repo in real implementation)
        # For now, just return as-is
        return submissions
    
    async def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a submission by ID."""
        return await self.submission_repo.get(submission_id)
    
    async def grade_submission(
        self,
        submission_id: str
    ) -> Dict[str, Any]:
        """Grade a submission using AI."""
        submission = await self.submission_repo.get(submission_id)
        if not submission:
            raise ValueError("Submission not found")
        
        # Check if already graded
        if submission.get('grade'):
            return submission
        
        # Get file info
        file_info = submission.get('file')
        if not file_info:
            raise ValueError("No file in submission")
        
        file_path = file_info['file_path']
        filename = file_info['filename']
        file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
        
        # Grade using AI
        grade_result = await self.ai_grading.grade_submission(
            file_path,
            submission['assignment_id'],
            file_ext
        )
        
        # Update submission with grade
        updates = {
            'grade': grade_result,
            'status': 'graded'
        }
        
        updated = await self.submission_repo.update(submission_id, updates)
        return updated

