from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

# 1. Create the Async Engine
# echo=settings.DEBUG logs SQL queries in development mode
from sqlalchemy.pool import NullPool

from app.core.config import settings

db_url = settings.TEST_DATABASE_URL if settings.TESTING else settings.DATABASE_URL
if not db_url:
    db_url = "sqlite+aiosqlite:///./packwise_dev.db"

engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True
}
if settings.TESTING:
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    db_url,
    **engine_kwargs
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
