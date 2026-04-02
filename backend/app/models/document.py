"""
Batman AI - Document Models
Pydantic schemas for uploaded PDFs and document chunks.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    """Response after successful PDF upload and indexing."""
    id: str
    filename: str
    page_count: int
    chunk_count: int
    message: str


class DocumentListItem(BaseModel):
    """Document listing for sidebar/dashboard."""
    id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: datetime


class DocumentChunk(BaseModel):
    """A single text chunk from a document."""
    text: str
    page_number: int
    chunk_index: int


class DocumentInDB(BaseModel):
    """Internal document representation stored in MongoDB."""
    user_id: str
    filename: str
    page_count: int
    chunk_count: int
    chunks: List[DocumentChunk] = Field(default_factory=list)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
