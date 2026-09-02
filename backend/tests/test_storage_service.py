import os
from io import BytesIO

import aiofiles
import pytest
from fastapi import UploadFile

from app.services.storage_service import StorageService


@pytest.fixture
def temp_storage_dir(tmp_path):
    # Use pytest's tmp_path to isolate storage tests
    return str(tmp_path / "uploads")

@pytest.fixture
def storage_service(temp_storage_dir):
    return StorageService(base_dir=temp_storage_dir)

def create_mock_upload_file(filename: str, content: bytes) -> UploadFile:
    file = BytesIO(content)
    upload_file = UploadFile(file=file, size=len(content), filename=filename)
    return upload_file

@pytest.mark.anyio
async def test_save_upload_success(storage_service, temp_storage_dir):
    content = b"fake image data"
    upload_file = create_mock_upload_file("test.png", content)
    
    storage_path = await storage_service.save_upload(upload_file)
    
    # Verify the path is within the base dir
    assert storage_path.startswith(temp_storage_dir)
    assert storage_path.endswith(".png")
    
    # Verify file actually exists and contains correct data
    assert os.path.exists(storage_path)
    
    async with aiofiles.open(storage_path, 'rb') as f:
        saved_content = await f.read()
        assert saved_content == content

@pytest.mark.anyio
async def test_delete_file(storage_service, temp_storage_dir):
    content = b"fake image data"
    upload_file = create_mock_upload_file("test.png", content)
    
    storage_path = await storage_service.save_upload(upload_file)
    assert os.path.exists(storage_path)
    
    storage_service.delete_file(storage_path)
    assert not os.path.exists(storage_path)

def test_get_extension(storage_service):
    assert storage_service._get_extension("image.PNG") == ".png"
    assert storage_service._get_extension("no_extension") == ""
    assert storage_service._get_extension(None) == ""
