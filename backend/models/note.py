from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    original_content: str = Field(..., min_length=1)
    summary: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    original_content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    original_content: str
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class NoteInDB(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    original_content: str
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NoteListResponse(BaseModel):
    notes: list[NoteResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
