"""
Batman AI - Embedding Service
Runs in Docker with GPU. Exposes REST API for sentence-transformers + FAISS.
The main backend calls this service via HTTP instead of running locally.
"""

from typing import Dict, List, Optional, Tuple

import faiss
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Batman AI - Embedding Service", version="1.0.0")

# ─── Global State ────────────────────────────────────────────────────────────
_model: Optional[SentenceTransformer] = None
_indices: Dict[str, faiss.IndexFlatIP] = {}
_chunks_store: Dict[str, List[dict]] = {}


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[EmbeddingService] Model loaded: all-MiniLM-L6-v2")
    return _model


# ─── Pydantic Models ──────────────────────────────────────────────────────────
class Chunk(BaseModel):
    text: str
    page_number: int
    chunk_index: int


class IndexRequest(BaseModel):
    user_id: str
    doc_id: str
    chunks: List[Chunk]


class SearchRequest(BaseModel):
    user_id: str
    doc_id: str
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    chunk: Chunk
    score: float


# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    """Pre-load embedding model on startup."""
    get_model()
    print("[EmbeddingService] Ready.")


@app.get("/health")
def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}


@app.post("/index", status_code=201)
def index_document(req: IndexRequest) -> dict:
    """Embed chunks and store in a FAISS index."""
    model = get_model()
    texts = [c.text for c in req.chunks]
    embeddings = model.encode(texts, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype=np.float32)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    key = f"{req.user_id}:{req.doc_id}"
    _indices[key] = index
    _chunks_store[key] = [c.model_dump() for c in req.chunks]

    print(f"[FAISS] Indexed {len(req.chunks)} chunks for key={key}")
    return {"indexed": len(req.chunks), "key": key}


@app.post("/search", response_model=List[SearchResult])
def search_similar(req: SearchRequest) -> List[SearchResult]:
    """Search for similar chunks using FAISS."""
    key = f"{req.user_id}:{req.doc_id}"
    if key not in _indices:
        return []

    model = get_model()
    query_emb = model.encode([req.query], normalize_embeddings=True)
    query_emb = np.array(query_emb, dtype=np.float32)

    scores, idx_arr = _indices[key].search(query_emb, req.top_k)
    stored = _chunks_store[key]

    results = []
    for idx, score in zip(idx_arr[0], scores[0]):
        if 0 <= idx < len(stored):
            results.append(SearchResult(chunk=Chunk(**stored[idx]), score=float(score)))
    return results


@app.delete("/index/{user_id}/{doc_id}")
def delete_index(user_id: str, doc_id: str) -> dict:
    """Remove a document's FAISS index."""
    key = f"{user_id}:{doc_id}"
    removed = key in _indices
    _indices.pop(key, None)
    _chunks_store.pop(key, None)
    return {"removed": removed, "key": key}


@app.get("/index/{user_id}/{doc_id}/exists")
def has_index(user_id: str, doc_id: str) -> dict:
    """Check if a FAISS index exists."""
    key = f"{user_id}:{doc_id}"
    return {"exists": key in _indices, "key": key}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
