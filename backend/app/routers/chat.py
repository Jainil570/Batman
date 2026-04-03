"""
Batman AI - Chat Router
REST + WebSocket endpoints for chat with streaming.
"""

import json
from datetime import datetime

from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)

from app.core.deps import get_current_user, get_db, rate_limit_check
from app.core.security import decode_access_token
from app.models.chat import (
    ChatCreate,
    ChatListItem,
    ChatResponse,
    Message,
    MessageCreate,
)
from app.services.embedding_service import has_index, index_document
from app.services.rag_engine import query_rag

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse, status_code=201)
async def create_chat(
    data: ChatCreate,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a new chat session for a document."""
    # Verify document exists and belongs to user
    doc = await db.documents.find_one(
        {"_id": ObjectId(data.document_id), "user_id": user["user_id"]}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Re-index if not in Docker embedding service
    if not await has_index(user["user_id"], data.document_id):
        from app.models.document import DocumentChunk

        chunks = [DocumentChunk(**c) for c in doc.get("chunks", [])]
        if chunks:
            await index_document(user["user_id"], data.document_id, chunks)

    now = datetime.utcnow()
    chat_doc = {
        "user_id": user["user_id"],
        "document_id": data.document_id,
        "title": data.title or f"Chat - {doc['filename']}",
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.chats.insert_one(chat_doc)

    return ChatResponse(
        id=str(result.inserted_id),
        title=chat_doc["title"],
        document_id=data.document_id,
        user_id=user["user_id"],
        messages=[],
        created_at=now,
        updated_at=now,
    )


@router.get("/list", response_model=list[ChatListItem])
async def list_chats(
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """List all chat sessions for the current user."""
    cursor = db.chats.find({"user_id": user["user_id"]}).sort("updated_at", -1)

    chats = []
    async for chat in cursor:
        chats.append(
            ChatListItem(
                id=str(chat["_id"]),
                title=chat["title"],
                document_id=chat["document_id"],
                message_count=len(chat.get("messages", [])),
                updated_at=chat["updated_at"],
            )
        )
    return chats


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Get a chat session with full message history."""
    chat = await db.chats.find_one(
        {"_id": ObjectId(chat_id), "user_id": user["user_id"]}
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return ChatResponse(
        id=str(chat["_id"]),
        title=chat["title"],
        document_id=chat["document_id"],
        user_id=chat["user_id"],
        messages=[Message(**m) for m in chat.get("messages", [])],
        created_at=chat["created_at"],
        updated_at=chat["updated_at"],
    )


@router.delete("/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Delete a chat session."""
    result = await db.chats.delete_one(
        {"_id": ObjectId(chat_id), "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")


@router.websocket("/ws/{chat_id}")
async def chat_websocket(websocket: WebSocket, chat_id: str):
    """
    WebSocket endpoint for streaming chat.
    Client sends: {"token": "...", "content": "user message"}
    Server sends: {"type": "token|sources|done|error", "content": "...", "sources": [...]}
    """
    await websocket.accept()

    try:
        # Authenticate via first message
        auth_data = await websocket.receive_json()
        token = auth_data.get("token", "")
        payload = decode_access_token(token)

        if not payload:
            await websocket.send_json({"type": "error", "content": "Invalid token"})
            await websocket.close()
            return

        user_id = payload["sub"]

        # Get chat and verify ownership
        from app.db.mongodb import get_database

        db = get_database()
        chat = await db.chats.find_one(
            {"_id": ObjectId(chat_id), "user_id": user_id}
        )
        if not chat:
            await websocket.send_json({"type": "error", "content": "Chat not found"})
            await websocket.close()
            return

        doc_id = chat["document_id"]

        # Re-index if needed (calls Docker embedding service)
        if not await has_index(user_id, doc_id):
            doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
            if doc:
                from app.models.document import DocumentChunk

                chunks = [DocumentChunk(**c) for c in doc.get("chunks", [])]
                if chunks:
                    await index_document(user_id, doc_id, chunks)

        # Chat loop
        while True:
            data = await websocket.receive_json()
            user_msg = data.get("content", "").strip()
            mode = data.get("mode", "normal")
            marks = int(data.get("marks", 0)) if data.get("marks") else None
            easy_to_remember = data.get("easy_to_remember", False)

            if not user_msg:
                continue

            # Save user message
            user_message = {
                "role": "user",
                "content": user_msg,
                "sources": [],
                "timestamp": datetime.utcnow(),
            }
            await db.chats.update_one(
                {"_id": ObjectId(chat_id)},
                {
                    "$push": {"messages": user_message},
                    "$set": {"updated_at": datetime.utcnow()},
                },
            )

            # Stream RAG response
            full_response = []
            all_sources = []

            async for chunk in query_rag(user_id, doc_id, user_msg, mode=mode, marks=marks, easy_to_remember=easy_to_remember):
                await websocket.send_json(chunk)
                if chunk["type"] == "token":
                    full_response.append(chunk["content"])
                elif chunk["type"] == "sources":
                    all_sources = chunk.get("sources", [])

            # Save assistant message
            assistant_message = {
                "role": "assistant",
                "content": "".join(full_response),
                "sources": all_sources,
                "timestamp": datetime.utcnow(),
            }
            await db.chats.update_one(
                {"_id": ObjectId(chat_id)},
                {
                    "$push": {"messages": assistant_message},
                    "$set": {"updated_at": datetime.utcnow()},
                },
            )

            # Update query count
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {"query_count": 1}},
            )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
