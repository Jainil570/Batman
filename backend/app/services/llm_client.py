"""
Batman AI - LLM Client
Ollama local LLM with Groq cloud fallback. Streaming support.
"""

import json
from typing import AsyncGenerator, Optional

import httpx

from app.core.config import settings


def _build_system_message(context: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False) -> str:
    base_msg = (
        "You are Batman AI, an expert exam preparation assistant. "
        "Answer questions strictly based on the provided document context. "
        "If the context doesn't contain the answer, say so honestly.\n\n"
    )

    if easy_to_remember:
        base_msg += (
            "EASY TO REMEMBER MODE: Format the answer strictly as a Markdown table, "
            "or very concise bullet points with mnemonic devices. "
            "Make it as easy to memorize as possible without extra fluff.\n\n"
        )
    elif mode == "student":
        base_msg += "STUDENT EXAM MODE: Format your answer according to the expected exam marks.\n"
        if marks == 1:
            base_msg += "CRITICAL: Provide ONLY a 1-2 sentence direct answer. Be extremely concise.\n\n"
        elif marks == 2:
            base_msg += "CRITICAL: Provide a short definition and exactly one example. Keep it brief.\n\n"
        elif marks == 5:
            base_msg += "CRITICAL: Structure with a main point, 3-4 bulleted sub-points, and a brief conclusion.\n\n"
        elif marks == 7:
            base_msg += "CRITICAL: Write a detailed essay-style answer. Include an introduction, detailed body paragraphs with key terms bolded, and a comprehensive conclusion.\n\n"
        else:
            base_msg += "Provide a clear, well-structured answer.\n\n"
    else:
        base_msg += "Be precise, concise, and helpful.\n\n"
        
    return base_msg + f"Context:\n{context}"

async def _stream_ollama(
    prompt: str, context: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False
) -> AsyncGenerator[str, None]:
    """Stream tokens from local Ollama."""
    system_msg = _build_system_message(context, mode, marks, easy_to_remember)

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        "stream": True,
    }

    if mode == "student":
        payload["options"] = {
            "temperature": 0.3, # Lower temperature for accurate exams
            "top_p": 0.9
        }
    else:
        payload["options"] = {
            "temperature": 0.7
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


async def _stream_groq(
    prompt: str, context: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False
) -> AsyncGenerator[str, None]:
    """Stream tokens from Groq cloud API (fallback)."""
    if not settings.GROQ_API_KEY:
        yield "Error: Groq API key not configured. Please set GROQ_API_KEY."
        return

    system_msg = _build_system_message(context, mode, marks, easy_to_remember)

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
    prompt: str, context: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False
) -> AsyncGenerator[str, None]:
    """
    Stream LLM response. Tries Ollama first, falls back to Groq.
    """
    try:
        async for token in _stream_ollama(prompt, context, mode, marks, easy_to_remember):
            yield token
    except Exception as ollama_err:
        print(f"[LLM] Ollama failed: {ollama_err}. Falling back to Groq.")
        try:
            async for token in _stream_groq(prompt, context, mode, marks, easy_to_remember):
                yield token
        except Exception as groq_err:
            yield f"Error: Both LLM providers failed. Ollama: {ollama_err}, Groq: {groq_err}"


async def generate_response(
    prompt: str, context: str, mode: str = "normal", marks: int = None, easy_to_remember: bool = False
) -> str:
    """Non-streaming LLM response (for quiz generation, etc.)."""
    tokens = []
    async for token in stream_llm_response(prompt, context, mode, marks, easy_to_remember):
        tokens.append(token)
    return "".join(tokens)
