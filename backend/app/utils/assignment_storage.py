"""
Storage utility for assignment files.
Handles file uploads and directory structure for assignments and submissions.
"""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from typing import List, Tuple

# Base storage directories
STORAGE_BASE = "storage"
ASSIGNMENTS_DIR = os.path.join(STORAGE_BASE, "assignments")
SUBMISSIONS_DIR = os.path.join(STORAGE_BASE, "submissions")
TESTS_DIR = os.path.join(STORAGE_BASE, "tests")

# Ensure base directories exist
os.makedirs(ASSIGNMENTS_DIR, exist_ok=True)
os.makedirs(SUBMISSIONS_DIR, exist_ok=True)
os.makedirs(TESTS_DIR, exist_ok=True)


def get_assignment_files_dir(assignment_id: str) -> str:
    """Get the directory path for assignment files."""
    path = os.path.join(ASSIGNMENTS_DIR, assignment_id, "files")
    os.makedirs(path, exist_ok=True)
    return path


def get_submission_dir(assignment_id: str, student_id: str) -> str:
    """Get the directory path for a student's submission."""
    path = os.path.join(SUBMISSIONS_DIR, assignment_id, student_id)
    os.makedirs(path, exist_ok=True)
    return path


def get_tests_dir(assignment_id: str) -> str:
    """Get the directory path for test cases."""
    path = os.path.join(TESTS_DIR, assignment_id)
    os.makedirs(path, exist_ok=True)
    return path


async def save_assignment_file(file: UploadFile, assignment_id: str) -> Tuple[str, str, int]:
    """
    Save an assignment file.
    Returns: (file_path, filename, file_size)
    """
    files_dir = get_assignment_files_dir(assignment_id)
    
    # Preserve original filename but add UUID to avoid conflicts
    original_filename = file.filename or "file"
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    
    file_path = os.path.join(files_dir, unique_filename)
    
    content = await file.read()
    file_size = len(content)
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    return file_path, original_filename, file_size


async def save_submission_file(file: UploadFile, assignment_id: str, student_id: str) -> Tuple[str, str, int]:
    """
    Save a submission file.
    Returns: (file_path, filename, file_size)
    """
    submission_dir = get_submission_dir(assignment_id, student_id)
    
    # Preserve original filename but add UUID to avoid conflicts
    original_filename = file.filename or "submission"
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    
    file_path = os.path.join(submission_dir, unique_filename)
    
    content = await file.read()
    file_size = len(content)
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    return file_path, original_filename, file_size


def get_file_content_type(filename: str) -> str:
    """Determine content type from filename extension."""
    ext = os.path.splitext(filename)[1].lower()
    content_types = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.py': 'text/x-python',
        '.ipynb': 'application/json',
        '.java': 'text/x-java-source',
        '.cpp': 'text/x-c++src',
        '.c': 'text/x-csrc',
        '.zip': 'application/zip',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.txt': 'text/plain',
    }
    return content_types.get(ext, 'application/octet-stream')

