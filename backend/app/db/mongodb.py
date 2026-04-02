"""
Batman AI - MongoDB Client
Async MongoDB connection using Motor.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_mongodb():
    """Initialize MongoDB connection."""
    global _client, _database
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _database = _client[settings.MONGODB_DB_NAME]

    # Create indexes
    await _database.users.create_index("email", unique=True)
    await _database.chats.create_index("user_id")
    await _database.documents.create_index("user_id")

    print(f"[MongoDB] Connected to {settings.MONGODB_DB_NAME}")


async def close_mongodb():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("[MongoDB] Connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    if _database is None:
        raise RuntimeError("MongoDB not initialized. Call connect_mongodb() first.")
    return _database
