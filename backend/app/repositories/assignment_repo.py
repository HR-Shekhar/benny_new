"""
Repository layer for assignments.
Abstracts storage operations - can be swapped with MongoDB adapter.
"""
from typing import Optional, List, Dict, Any
from app.storage.assignment_storage import AssignmentStorage, SubmissionStorage


class AssignmentRepository:
    """Repository for assignment operations."""
    
    def __init__(self):
        self.storage = AssignmentStorage()
    
    async def create(self, assignment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new assignment."""
        return self.storage.create(assignment_data)
    
    async def get(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get an assignment by ID."""
        return self.storage.get(assignment_id)
    
    async def list_all(self) -> List[Dict[str, Any]]:
        """List all assignments."""
        return self.storage.list_all()
    
    async def update(self, assignment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an assignment."""
        return self.storage.update(assignment_id, updates)
    
    async def add_file(self, assignment_id: str, file_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add a file to an assignment."""
        return self.storage.add_file(assignment_id, file_data)


class SubmissionRepository:
    """Repository for submission operations."""
    
    def __init__(self):
        self.storage = SubmissionStorage()
    
    async def create(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new submission."""
        return self.storage.create(submission_data)
    
    async def get(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a submission by ID."""
        return self.storage.get(submission_id)
    
    async def get_by_assignment(self, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all submissions for an assignment."""
        return self.storage.get_by_assignment(assignment_id)
    
    async def get_by_student_and_assignment(
        self, student_id: str, assignment_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a student's submission for a specific assignment."""
        return self.storage.get_by_student_and_assignment(student_id, assignment_id)
    
    async def update(self, submission_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a submission."""
        return self.storage.update(submission_id, updates)

