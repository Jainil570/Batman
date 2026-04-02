"""
Batman AI - LLM Client
Ollama local LLM with Groq cloud fallback. Streaming support.
"""

import json
from typing import AsyncGenerator, Optional

import httpx

from app.core.config import settings


async def _stream_ollama(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """Stream tokens from local Ollama."""
    system_msg = (
        "You are Batman AI, an expert exam preparation assistant. "
        "Answer questions based on the provided document context. "
        "Be precise, concise, and helpful. If the context doesn't contain "
        "the answer, say so honestly.\n\n"
        f"Context:\n{context}"
    )

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json=payload,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    token = data.get("message", {}).get("content", "")
                    if token:
                        yield token
                    if data.get("done", False):
                        break


async def _stream_groq(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """Stream tokens from Groq cloud API (fallback)."""
    if not settings.GROQ_API_KEY:
        yield "Error: Groq API key not configured. Please set GROQ_API_KEY."
        return

    system_msg = (
        "You are Batman AI, an expert exam preparation assistant. "
        "Answer questions based on the provided document context. "
        "Be precise, concise, and helpful.\n\n"
        f"Context:\n{context}"
    )

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    data = json.loads(data_str)
                    delta = data["choices"][0].get("delta", {})
                    token = delta.get("content", "")
                    if token:
                        yield token


async def stream_llm_response(
    prompt: str, context: str
) -> AsyncGenerator[str, None]:
    """
    Stream LLM response. Tries Ollama first, falls back to Groq.
    """
    try:
        async for token in _stream_ollama(prompt, context):
            yield token
    except Exception as ollama_err:
        print(f"[LLM] Ollama failed: {ollama_err}. Falling back to Groq.")
        try:
            async for token in _stream_groq(prompt, context):
                yield token
        except Exception as groq_err:
            yield f"Error: Both LLM providers failed. Ollama: {ollama_err}, Groq: {groq_err}"


async def generate_response(prompt: str, context: str) -> str:
    """Non-streaming LLM response (for quiz generation, etc.)."""
    tokens = []
    async for token in stream_llm_response(prompt, context):
        tokens.append(token)
    return "".join(tokens)
