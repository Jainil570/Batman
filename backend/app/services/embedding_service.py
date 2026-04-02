"""
Batman AI - Embedding Service Client
HTTP client that calls the Docker embedding-service container.
No sentence-transformers or FAISS installed locally — all runs in Docker.
"""

from typing import List, Optional, Tuple

import httpx

from app.core.config import settings
from app.models.document import DocumentChunk

# Base URL of the Docker embedding service (http://localhost:8001)
_BASE = settings.EMBEDDING_SERVICE_URL


async def index_document(user_id: str, doc_id: str, chunks: List[DocumentChunk]) -> int:
    """
    Send chunks to the Docker embedding service to be indexed in FAISS.
    Returns the number of indexed chunks.
    """
    payload = {
        "user_id": user_id,
        "doc_id": doc_id,
        "chunks": [c.model_dump() for c in chunks],
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{_BASE}/index", json=payload)
        resp.raise_for_status()
        data = resp.json()
        indexed = data.get("indexed", 0)
        print(f"[EmbeddingClient] Indexed {indexed} chunks for {user_id}:{doc_id}")
        return indexed


async def search_similar(
    user_id: str, doc_id: str, query: str, top_k: int = 5
) -> List[Tuple[DocumentChunk, float]]:
    """
    Search for similar chunks in the Docker FAISS index.
    Returns list of (DocumentChunk, score) tuples.
    """
    payload = {
        "user_id": user_id,
        "doc_id": doc_id,
        "query": query,
        "top_k": top_k,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(f"{_BASE}/search", json=payload)
        resp.raise_for_status()
        results = resp.json()

    return [
        (DocumentChunk(**item["chunk"]), item["score"])
        for item in results
    ]


async def delete_index(user_id: str, doc_id: str) -> bool:
    """Remove a document's FAISS index from the Docker embedding service."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.delete(f"{_BASE}/index/{user_id}/{doc_id}")
        resp.raise_for_status()
        return resp.json().get("removed", False)


async def has_index(user_id: str, doc_id: str) -> bool:
    """Check if a FAISS index exists in the Docker embedding service."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{_BASE}/index/{user_id}/{doc_id}/exists")
        resp.raise_for_status()
        return resp.json().get("exists", False)
