from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# 1. Create the Async Engine
# echo=settings.DEBUG logs SQL queries in development mode
db_url = settings.DATABASE_URL or "sqlite+aiosqlite:///./packwise_dev.db"
engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    future=True
)

# 3. Create the Async Session Factory
# expire_on_commit=False is standard for async SQLAlchemy to prevent lazy-loading errors
async_session_factory = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 4. Declarative Base for models
Base = declarative_base()

# 5. FastAPI Dependency for database sessions
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to yield an async database session per request.
    Closes automatically after the request completes.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
