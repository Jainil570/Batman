"""
Batman AI - RAG Engine
Retrieval Augmented Generation: query → retrieve (Docker) → generate (Ollama Docker).
Note: retrieve_context is now async because embedding_service uses HTTP calls.
"""

from typing import AsyncGenerator, List, Tuple

from app.services.embedding_service import search_similar
from app.services.llm_client import stream_llm_response


async def retrieve_context(
    user_id: str, doc_id: str, query: str, top_k: int = 5
) -> Tuple[str, List[str]]:
    """
    Retrieve relevant context from the Docker FAISS index.
    Returns (combined_context, source_references).
    """
    results = await search_similar(user_id, doc_id, query, top_k=top_k)

    if not results:
        return "", []

    context_parts = []
    sources = []

    for chunk, score in results:
        if score > 0.1:  # Relevance threshold lowered for better matches
            context_parts.append(chunk.text)
            source_ref = f"Page {chunk.page_number}, Chunk {chunk.chunk_index}"
            if source_ref not in sources:
                sources.append(source_ref)

    combined_context = "\n\n---\n\n".join(context_parts)
    return combined_context, sources


async def query_rag(
    user_id: str, doc_id: str, query: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False
) -> AsyncGenerator[dict, None]:
    """
    Full RAG pipeline with streaming.
    Yields dicts: {"type": "sources"|"token"|"done", ...}
    """
    # Step 1: Retrieve context from Docker embedding service
    # Token Optimization: If only 1-2 marks requested, we don't need 5 large chunks
    top_k = 5
    if mode == "student" and marks in [1, 2]:
        top_k = 2

    context, sources = await retrieve_context(user_id, doc_id, query, top_k=top_k)

    # Yield sources first
    if sources:
        yield {"type": "sources", "sources": sources}

    if not context:
        yield {
            "type": "token",
            "content": (
                "I couldn't find relevant information in the document "
                "for your question. Please try rephrasing or ask about "
                "a different topic covered in the document."
            ),
        }
        yield {"type": "done"}
        return

    # Step 2: Stream LLM response with retrieved context (Ollama Docker)
    async for token in stream_llm_response(query, context, mode=mode, marks=marks, easy_to_remember=easy_to_remember):
        yield {"type": "token", "content": token}

    yield {"type": "done"}
