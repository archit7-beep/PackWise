import os
import uuid

import aiofiles
from fastapi import UploadFile

from app.core.exceptions import PackWiseException
from app.core.logging import logger

# Temporary MVP configuration for local storage. 
# IMPORTANT DOCUMENTATION: 
# - This is local development/MVP storage only.
# - It is NOT durable production storage. 
# - Deployment or container replacement WILL result in data loss (orphan DB records).
# - Future Supabase Storage integration will replace this implementation entirely.
# - Do NOT treat this abstraction as equivalent to distributed object storage.
STORAGE_DIR = "uploads"

class StorageService:
    def __init__(self, base_dir: str = STORAGE_DIR):
        self.base_dir = base_dir
        # Ensure the storage directory exists
        os.makedirs(self.base_dir, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> str:
        """
        Saves the uploaded file to the local filesystem abstraction.
        Returns the relative storage path (e.g., 'uploads/uuid-file.ext').
        """
        # Generate a safe UUID filename to prevent collisions and path injection
        ext = self._get_extension(file.filename)
        safe_filename = f"{uuid.uuid4()}{ext}"
        storage_path = os.path.join(self.base_dir, safe_filename)

        try:
            # We use aiofiles to stream the upload to disk asynchronously
            # This prevents blocking the main FastAPI thread for large images.
            async with aiofiles.open(storage_path, 'wb') as out_file:
                while content := await file.read(1024 * 1024):  # 1MB chunks
                    await out_file.write(content)
            
            logger.info(f"Successfully saved file to {storage_path}")
            # Ensure file pointer is reset so downstream consumers can still read it if needed
            await file.seek(0)
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to save file to {storage_path}: {e!s}")
            self.delete_file(storage_path) # Clean up partial file on failure
            raise PackWiseException(
                message="Failed to persist uploaded image.",
                code="STORAGE_ERROR",
                status_code=500
            ) from e

    def delete_file(self, storage_path: str) -> None:
        """
        Deletes a file from the storage layer.
        Used for transaction cleanup if the downstream database insertion fails.
        """
        try:
            if os.path.exists(storage_path):
                os.remove(storage_path)
                logger.info(f"Cleaned up file at {storage_path}")
        except Exception as e:
            # We log but do not raise here, as cleanup failures shouldn't crash the rollback itself
            logger.error(f"Failed to delete file {storage_path} during cleanup: {e!s}")

    def _get_extension(self, filename: str | None) -> str:
        if not filename:
            return ""
        _, ext = os.path.splitext(filename)
        return ext.lower()
