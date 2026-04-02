"""
Batman AI - PDF Processing Service
Extract text from PDFs using PyMuPDF, chunk into segments.
"""

import io
from typing import List, Tuple

import fitz  # PyMuPDF

from app.core.config import settings
from app.models.document import DocumentChunk


def extract_text_from_pdf(pdf_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extract text from PDF bytes.
    Returns list of (page_number, text) tuples.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    if doc.page_count > settings.MAX_PDF_PAGES:
        doc.close()
        raise ValueError(
            f"PDF exceeds max pages ({settings.MAX_PDF_PAGES}). "
            f"Got {doc.page_count} pages."
        )

    pages = []
    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if text:
            pages.append((page_num + 1, text))

    doc.close()
    return pages


def chunk_text(
    pages: List[Tuple[int, str]],
    chunk_size: int = None,
    chunk_overlap: int = None,
) -> List[DocumentChunk]:
    """
    Split page texts into overlapping chunks.
    Returns list of DocumentChunk with metadata.
    """
    chunk_size = chunk_size or settings.CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    chunks: List[DocumentChunk] = []
    chunk_index = 0

    for page_num, text in pages:
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text_content = text[start:end].strip()

            if chunk_text_content:
                chunks.append(
                    DocumentChunk(
                        text=chunk_text_content,
                        page_number=page_num,
                        chunk_index=chunk_index,
                    )
                )
                chunk_index += 1

            start += chunk_size - chunk_overlap

            if chunk_index >= settings.MAX_CHUNKS:
                return chunks

    return chunks


def process_pdf(pdf_bytes: bytes) -> Tuple[List[DocumentChunk], int]:
    """
    Full PDF processing pipeline.
    Returns (chunks, page_count).
    """
    pages = extract_text_from_pdf(pdf_bytes)
    page_count = len(pages)
    chunks = chunk_text(pages)
    return chunks, page_count
