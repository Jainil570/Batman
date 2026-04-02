"""
Batman AI - Chat Models
Pydantic schemas for chat sessions and messages.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    """Request schema for sending a chat message."""
    content: str = Field(..., min_length=1, max_length=5000)


class Message(BaseModel):
    """A single chat message."""
    role: Literal["user", "assistant"] = "user"
    content: str
    sources: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatCreate(BaseModel):
    """Request schema for creating a new chat session."""
    document_id: str
    title: Optional[str] = None


class ChatResponse(BaseModel):
    """Response schema for a chat session."""
    id: str
    title: str
    document_id: str
    user_id: str
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ChatListItem(BaseModel):
    """Compact chat listing for sidebar."""
    id: str
    title: str
    document_id: str
    message_count: int
    updated_at: datetime


class StreamChunk(BaseModel):
    """WebSocket streaming chunk."""
    type: Literal["token", "sources", "done", "error"] = "token"
    content: str = ""
    sources: List[str] = Field(default_factory=list)
