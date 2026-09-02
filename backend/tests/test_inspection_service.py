import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import PackWiseException
from app.database.models import (
    Image,
    Inspection,
    InspectionStatus,
    OCRResult,
)
from app.services.inspection_service import (
    create_inspection,
    get_compliance_result,
    get_inspection,
    get_ocr_result,
)


@pytest.fixture
def mock_db_session():
    # Create an AsyncMock for the SQLAlchemy AsyncSession
    session = AsyncMock(spec=AsyncSession)
    
    # We need to simulate the refresh behavior so that the inspection object
    # appears to have its relationships populated, although for unit testing
    # the raw Python object state is usually enough.
    async def mock_refresh(instance):
        pass
    
    session.refresh = AsyncMock(side_effect=mock_refresh)
    return session

@pytest.mark.anyio
async def test_create_inspection_success(mock_db_session):
    """
    Verify successful creation of Inspection and Image records.
    Proves:
    1. Returns UUID inspection
    2. Status is CREATED
    3. db.add is called twice
    4. Transaction is committed
    """
    storage_paths = ["uploads/test_uuid1.png", "uploads/test_uuid2.png"]
    # Mock get_inspection since we're only testing create_inspection
    with patch("app.services.inspection_service.get_inspection", new_callable=AsyncMock) as mock_get:
        async def mock_get_inspection(db, inspection_id):
            return Inspection(id=inspection_id, status=InspectionStatus.CREATED.value)
        mock_get.side_effect = mock_get_inspection
        
        # Execute service
        inspection = await create_inspection(
            db=mock_db_session,
            storage_paths=storage_paths
        )
        
        # Assertions
        assert isinstance(inspection, Inspection)
        assert isinstance(inspection.id, uuid.UUID)
        assert inspection.status == InspectionStatus.CREATED.value
        
        # Verify session calls
        assert mock_db_session.add.call_count == 3
    
    # Extract the added models
    added_objects = [call[0][0] for call in mock_db_session.add.call_args_list]
    inspections_added = [obj for obj in added_objects if isinstance(obj, Inspection)]
    images_added = [obj for obj in added_objects if isinstance(obj, Image)]
    
    assert len(inspections_added) == 1
    assert len(images_added) == 2
    
    db_inspection = inspections_added[0]
    
    # Verify relationships and data
    assert db_inspection.id == inspection.id
    for db_image in images_added:
        assert db_image.inspection_id == inspection.id
    assert images_added[0].storage_path == storage_paths[0]
    assert images_added[1].storage_path == storage_paths[1]
    
    # Verify transaction boundaries
    mock_db_session.commit.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once_with(db_inspection)

@pytest.mark.anyio
async def test_create_inspection_transaction_failure(mock_db_session):
    """
    Verify rollback behavior when database commit fails.
    Proves:
    1. Rollback occurs
    2. Exception is raised as a controlled PackWiseException
    3. Error is not silently swallowed
    """
    storage_paths = ["uploads/fail.png"]
    
    # Make the commit fail
    mock_db_session.commit.side_effect = Exception("Simulated DB failure")
    
    with pytest.raises(PackWiseException) as exc_info:
        await create_inspection(db=mock_db_session, storage_paths=storage_paths)
        
    assert exc_info.value.code == "DATABASE_ERROR"
    assert exc_info.value.status_code == 500
    
    # Verify rollback was called
    mock_db_session.rollback.assert_awaited_once()

@pytest.mark.anyio
async def test_get_inspection_success(mock_db_session):
    mock_result = MagicMock()
    fake_inspection = Inspection(id=uuid.uuid4(), status=InspectionStatus.CREATED.value)
    mock_result.scalars.return_value.first.return_value = fake_inspection
    mock_db_session.execute.return_value = mock_result
    
    result = await get_inspection(mock_db_session, fake_inspection.id)
    assert result.id == fake_inspection.id

@pytest.mark.anyio
async def test_get_inspection_not_found(mock_db_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = mock_result
    
    with pytest.raises(PackWiseException) as exc_info:
        await get_inspection(mock_db_session, uuid.uuid4())
        
    assert exc_info.value.code == "INSPECTION_NOT_FOUND"
    assert exc_info.value.status_code == 404

@pytest.mark.anyio
async def test_get_ocr_result_success(mock_db_session):
    # Mock for get_inspection
    mock_inspection_result = MagicMock()
    fake_inspection = Inspection(id=uuid.uuid4(), status=InspectionStatus.COMPLETED.value)
    mock_inspection_result.scalars.return_value.first.return_value = fake_inspection
    
    # Mock for get_ocr_result
    mock_ocr_result = MagicMock()
    fake_ocr = OCRResult(id=uuid.uuid4(), inspection_id=fake_inspection.id, full_text="test")
    mock_ocr_result.scalars.return_value.first.return_value = fake_ocr
    
    mock_db_session.execute.side_effect = [mock_inspection_result, mock_ocr_result]
    
    result = await get_ocr_result(mock_db_session, fake_inspection.id)
    assert result.id == fake_ocr.id
    assert result.full_text == "test"

@pytest.mark.anyio
async def test_get_ocr_result_not_ready(mock_db_session):
    # Mock for get_inspection
    mock_inspection_result = MagicMock()
    fake_inspection = Inspection(id=uuid.uuid4(), status=InspectionStatus.CREATED.value)
    mock_inspection_result.scalars.return_value.first.return_value = fake_inspection
    
    # Mock for get_ocr_result
    mock_ocr_result = MagicMock()
    mock_ocr_result.scalars.return_value.first.return_value = None
    
    mock_db_session.execute.side_effect = [mock_inspection_result, mock_ocr_result]
    
    with pytest.raises(PackWiseException) as exc_info:
        await get_ocr_result(mock_db_session, fake_inspection.id)
        
    assert exc_info.value.code == "OCR_NOT_READY"
    assert exc_info.value.status_code == 404

@pytest.mark.anyio
async def test_get_compliance_result_not_ready(mock_db_session):
    mock_inspection_result = MagicMock()
    fake_inspection = Inspection(id=uuid.uuid4())
    mock_inspection_result.scalars.return_value.first.return_value = fake_inspection
    
    mock_compliance_result = MagicMock()
    mock_compliance_result.scalars.return_value.first.return_value = None
    
    mock_db_session.execute.side_effect = [mock_inspection_result, mock_compliance_result]
    
    with pytest.raises(PackWiseException) as exc_info:
        await get_compliance_result(mock_db_session, fake_inspection.id)
        
    assert exc_info.value.code == "COMPLIANCE_NOT_READY"
    assert exc_info.value.status_code == 404

