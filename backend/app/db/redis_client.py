"""
Batman AI - Redis Client
Async Redis connection using redis-py async.
"""

import redis.asyncio as aioredis

from app.core.config import settings

_redis: aioredis.Redis | None = None


async def connect_redis():
    """Initialize Redis connection."""
    global _redis
    try:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await _redis.ping()
        print("[Redis] Connected successfully")
    except Exception as e:
        print(f"[Redis] Connection failed: {e}. Continuing without cache.")
        _redis = None


async def close_redis():
    """Close Redis connection."""
    global _redis
    if _redis:
        await _redis.close()
        print("[Redis] Connection closed")


async def get_redis() -> aioredis.Redis | None:
    """Get the Redis client instance. Returns None if unavailable."""
    return _redis
