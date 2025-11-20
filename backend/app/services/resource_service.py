from app.utils.pdf_ppt_summarizer import summarize_file
from app.repositories.resource_repo import ResourceRepo

class ResourceService:
    def __init__(self, repo: ResourceRepo):
        self.repo = repo

    async def create_resource(self, faculty_id: str, file_path: str, title: str, description: str, course: dict):
        data = {
            "faculty_id": faculty_id,
            "file_path": file_path,
            "title": title,
            "description": description,
            "course": course
        }
        return await self.repo.create(data)

    async def summarize_uploaded_resource(self, resource):
        return summarize_file(resource["file_path"])

    async def summarize_temp_file(self, path: str):
        return summarize_file(path)
