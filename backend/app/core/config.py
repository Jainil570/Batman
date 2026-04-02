"""
Batman AI - Core Configuration
All settings loaded from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Batman AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # JWT
    JWT_SECRET_KEY: str = "batman-ai-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "batman_ai"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_TTL_SECONDS: int = 86400  # 24h

    # Ollama (Docker)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    # Embedding Service (Docker — sentence-transformers + FAISS)
    EMBEDDING_SERVICE_URL: str = "http://localhost:8001"

    # Groq (fallback)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # PDF Processing
    MAX_PDF_SIZE_MB: int = 20
    MAX_PDF_PAGES: int = 100
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    MAX_CHUNKS: int = 50

    # Rate Limiting
    RATE_LIMIT_QPM: int = 10

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
