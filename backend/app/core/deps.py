"""
Batman AI - Dependency Injection
FastAPI dependencies for DB clients, auth, and rate limiting.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.db.mongodb import get_database
from app.db.redis_client import get_redis

security_scheme = HTTPBearer()


async def get_db():
    """Get MongoDB database instance."""
    return get_database()


async def get_cache():
    """Get Redis client instance."""
    return await get_redis()


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials, Depends(security_scheme)
    ],
):
    """Extract and validate the current user from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )
    return {"user_id": user_id, "email": payload.get("email", "")}


async def rate_limit_check(
    user: dict = Depends(get_current_user),
    redis=Depends(get_cache),
):
    """Check rate limit: 10 queries per minute per user."""
    if redis is None:
        return user  # Skip if Redis unavailable

    key = f"rate_limit:{user['user_id']}"
    current = await redis.get(key)

    if current and int(current) >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Max 10 queries per minute.",
        )

    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    await pipe.execute()

    return user
