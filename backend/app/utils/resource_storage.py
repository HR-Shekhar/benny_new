import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "uploads/resources"

async def save_resource_file(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{uuid.uuid4()}{ext}"

    path = os.path.join(UPLOAD_DIR, filename)

    # Read file content asynchronously
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    return path
