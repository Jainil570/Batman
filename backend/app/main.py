"""
Batman AI - FastAPI Main Application
App initialization, CORS, lifespan, and router mounting.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import close_mongodb, connect_mongodb
from app.db.redis_client import close_redis, connect_redis
from app.routers import auth, chat, docs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # Startup
    print(f"[Batman AI] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await connect_mongodb()
    await connect_redis()
    # Note: Embedding model runs in Docker (http://localhost:8001)
    # Note: Ollama LLM runs in Docker (http://localhost:11434)

    yield

    # Shutdown
    await close_mongodb()
    await close_redis()
    print("[Batman AI] Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Premium AI-powered exam preparation assistant",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(docs.router)
app.include_router(chat.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "operational",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
