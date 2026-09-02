import asyncio
import os

import pytest

# Set environment variable to indicate we are running tests.
# Must be set BEFORE app modules are imported so config.py picks it up.
os.environ["TESTING"] = "True"
os.environ["TEST_DATABASE_URL"] = "postgresql+asyncpg://postgres:Packwise%402007@db.sntyzjnuwwqzwkiutfug.supabase.co:5432/packwise_test"

# Now import app modules
from app.database.connection import engine
from app.database.models import Base


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Ensure the test database schema is created before any tests run,
    and drop all tables afterwards to keep the test DB clean.
    This is synchronous to pytest to avoid ScopeMismatch and async warnings on sync tests.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            
    async def teardown_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await engine.dispose()
        
    loop.run_until_complete(init_db())
    
    yield
    
    loop.run_until_complete(teardown_db())
    loop.close()
