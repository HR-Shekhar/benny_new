"""
JSON-based storage layer for assignments and submissions.
Designed to be easily replaceable with MongoDB or other databases.
"""
import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from uuid import uuid4

STORAGE_DIR = "storage"
ASSIGNMENTS_FILE = os.path.join(STORAGE_DIR, "assignments.json")
SUBMISSIONS_FILE = os.path.join(STORAGE_DIR, "submissions.json")

# Ensure storage directory exists
os.makedirs(STORAGE_DIR, exist_ok=True)


def _load_json(file_path: str) -> Dict[str, Any]:
    """Load JSON file, return empty dict if file doesn't exist."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def _save_json(file_path: str, data: Dict[str, Any]):
    """Save data to JSON file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, default=str)


class AssignmentStorage:
    """Storage interface for assignments. Can be replaced with MongoDB adapter."""
    
    def create(self, assignment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new assignment."""
        assignments = _load_json(ASSIGNMENTS_FILE)
        
        assignment_id = str(uuid4())
        assignment_data['id'] = assignment_id
        assignment_data['created_at'] = datetime.now(timezone.utc).isoformat()
        assignment_data.setdefault('status', 'active')
        assignment_data.setdefault('files', [])
        
        assignments[assignment_id] = assignment_data
        _save_json(ASSIGNMENTS_FILE, assignments)
        
        return assignment_data
    
    def get(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get an assignment by ID."""
        assignments = _load_json(ASSIGNMENTS_FILE)
        return assignments.get(assignment_id)
    
    def list_all(self) -> List[Dict[str, Any]]:
        """List all assignments."""
        assignments = _load_json(ASSIGNMENTS_FILE)
        return list(assignments.values())
    
    def update(self, assignment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an assignment."""
        assignments = _load_json(ASSIGNMENTS_FILE)
        if assignment_id not in assignments:
            return None
        
        assignments[assignment_id].update(updates)
        _save_json(ASSIGNMENTS_FILE, assignments)
        return assignments[assignment_id]
    
    def add_file(self, assignment_id: str, file_data: Dict[str, Any]):
        """Add a file to an assignment."""
        assignments = _load_json(ASSIGNMENTS_FILE)
        if assignment_id not in assignments:
            return None
        
        if 'files' not in assignments[assignment_id]:
            assignments[assignment_id]['files'] = []
        
        assignments[assignment_id]['files'].append(file_data)
        _save_json(ASSIGNMENTS_FILE, assignments)
        return assignments[assignment_id]


class SubmissionStorage:
    """Storage interface for submissions. Can be replaced with MongoDB adapter."""
    
    def create(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new submission."""
        submissions = _load_json(SUBMISSIONS_FILE)
        
        submission_id = str(uuid4())
        submission_data['id'] = submission_id
        submission_data['submitted_at'] = datetime.now(timezone.utc).isoformat()
        submission_data.setdefault('status', 'pending')
        submission_data.setdefault('is_late', False)
        
        # Initialize submissions dict if needed
        if 'submissions' not in submissions:
            submissions['submissions'] = {}
        
        submissions['submissions'][submission_id] = submission_data
        _save_json(SUBMISSIONS_FILE, submissions)
        
        return submission_data
    
    def get(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a submission by ID."""
        submissions = _load_json(SUBMISSIONS_FILE)
        if 'submissions' not in submissions:
            return None
        return submissions['submissions'].get(submission_id)
    
    def get_by_assignment(self, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all submissions for an assignment."""
        submissions = _load_json(SUBMISSIONS_FILE)
        if 'submissions' not in submissions:
            return []
        
        return [
            sub for sub in submissions['submissions'].values()
            if sub.get('assignment_id') == assignment_id
        ]
    
    def get_by_student_and_assignment(
        self, student_id: str, assignment_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a student's submission for a specific assignment."""
        submissions = _load_json(SUBMISSIONS_FILE)
        if 'submissions' not in submissions:
            return None
        
        for sub in submissions['submissions'].values():
            if (sub.get('student_id') == student_id and 
                sub.get('assignment_id') == assignment_id):
                return sub
        return None
    
    def update(self, submission_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a submission."""
        submissions = _load_json(SUBMISSIONS_FILE)
        if 'submissions' not in submissions:
            return None
        
        if submission_id not in submissions['submissions']:
            return None
        
        submissions['submissions'][submission_id].update(updates)
        _save_json(SUBMISSIONS_FILE, submissions)
        return submissions['submissions'][submission_id]

