"""
Batman AI - Documents Router
PDF upload, listing, and deletion endpoints.
"""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.models.document import DocumentListItem, DocumentUploadResponse
from app.services.embedding_service import delete_index, index_document
from app.services.pdf_service import process_pdf

router = APIRouter(prefix="/api/v1/docs", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Upload and index a PDF document."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    # Read and validate size
    pdf_bytes = await file.read()
    size_mb = len(pdf_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_PDF_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_PDF_SIZE_MB}MB limit",
        )

    # Process PDF
    try:
        chunks, page_count = process_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Store metadata in MongoDB
    doc_record = {
        "user_id": user["user_id"],
        "filename": file.filename,
        "page_count": page_count,
        "chunk_count": len(chunks),
        "chunks": [c.model_dump() for c in chunks],
        "uploaded_at": datetime.utcnow(),
    }
    result = await db.documents.insert_one(doc_record)
    doc_id = str(result.inserted_id)

    # Index in Docker embedding service (async HTTP)
    await index_document(user["user_id"], doc_id, chunks)

    # Update user stats
    await db.users.update_one(
        {"_id": ObjectId(user["user_id"])},
        {"$inc": {"documents_uploaded": 1}},
    )

    return DocumentUploadResponse(
        id=doc_id,
        filename=file.filename,
        page_count=page_count,
        chunk_count=len(chunks),
        message=f"Successfully indexed {page_count} pages into {len(chunks)} chunks",
    )


@router.get("/list", response_model=list[DocumentListItem])
async def list_documents(
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """List all documents uploaded by the current user."""
    cursor = db.documents.find(
        {"user_id": user["user_id"]},
        {"chunks": 0},  # Exclude chunk data for listing
    ).sort("uploaded_at", -1)

    docs = []
    async for doc in cursor:
        docs.append(
            DocumentListItem(
                id=str(doc["_id"]),
                filename=doc["filename"],
                page_count=doc["page_count"],
                chunk_count=doc["chunk_count"],
                uploaded_at=doc["uploaded_at"],
            )
        )
    return docs


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Delete a document and its FAISS index."""
    result = await db.documents.delete_one(
        {"_id": ObjectId(doc_id), "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from Docker embedding service
    await delete_index(user["user_id"], doc_id)

    # Delete associated chats
    await db.chats.delete_many(
        {"document_id": doc_id, "user_id": user["user_id"]}
    )
