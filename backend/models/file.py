from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


ALLOWED_EXTENSIONS = {
    "text": [".txt"],
    "pdf": [".pdf"],
    "image": [".jpg", ".jpeg", ".png"],
    "audio": [".mp3", ".wav"],
    "video": [".mp4", ".mov"],
}

ALL_ALLOWED_EXTENSIONS = [ext for exts in ALLOWED_EXTENSIONS.values() for ext in exts]


class FileResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: int
    file_url: str
    upload_date: datetime
    status: str


class FileInDB(BaseModel):
    id: Optional[str] = None
    user_id: str
    file_name: str
    file_type: str          # category: text/pdf/image/audio/video
    file_extension: str     # actual extension: .pdf, .mp3, etc.
    file_size: int          # bytes
    file_url: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "uploaded"


class FileListResponse(BaseModel):
    files: list[FileResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
