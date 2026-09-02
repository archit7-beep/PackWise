import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import Base, engine, get_db
from app.database.models import (
    InspectionStatus,
)


def test_models_importable_and_configured():
    """Verify all MVP models are successfully initialized into SQLAlchemy metadata"""
    # Check that tables are registered
    tables = Base.metadata.tables.keys()
    
    assert "inspections" in tables
    assert "images" in tables
    assert "ocr_results" in tables
    assert "extracted_products" in tables
    assert "compliance_results" in tables
    assert "compliance_violations" in tables

def test_inspection_status_enum():
    """Verify that the InspectionStatus enum is correctly structured"""
    assert InspectionStatus.CREATED.value == "CREATED"
    assert InspectionStatus.PROCESSING.value == "PROCESSING"
    assert InspectionStatus.COMPLETED.value == "COMPLETED"
    assert InspectionStatus.FAILED.value == "FAILED"

@pytest.mark.anyio
async def test_database_session_dependency():
    """Verify the get_db dependency yields an AsyncSession"""
    # We grab the generator and manually step it once to get the session
    gen = get_db()
    session = await gen.__anext__()
    
    try:
        assert isinstance(session, AsyncSession)
    finally:
        # Step again to trigger the finally block in get_db
        try:
            await gen.__anext__()
        except StopAsyncIteration:
            pass

def test_sqlalchemy_url_configuration():
    """Verify that the engine string uses asyncpg driver internally"""
    # engine.url.drivername should be 'postgresql+asyncpg' or similar 
    # depending on how the config was passed. We check if asyncpg is present.
    assert "asyncpg" in engine.url.drivername
