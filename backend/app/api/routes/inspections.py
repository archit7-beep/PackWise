import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import PackWiseException
from app.core.logging import logger
from app.database.connection import get_db
from app.schemas.inspection import (
    ComplianceResultResponse,
    InspectionResponse,
    OCRResultResponse,
)
from app.services.inspection_service import (
    create_inspection,
    get_compliance_result,
    get_inspection,
    get_ocr_result,
)
from app.services.pipeline_service import pipeline_service
from app.services.storage_service import StorageService

router = APIRouter()
storage_service = StorageService()

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def upload_inspection_images(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload one or more images to start a new inspection.
    Triggers the background pipeline automatically.
    """
    # 1. Validation
    if not files:
        raise PackWiseException(message="No files uploaded.", code="INVALID_UPLOAD", status_code=400)
        
    for file in files:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise PackWiseException(
                message=f"Unsupported file type: {file.content_type}. Allowed types: JPEG, PNG, WebP.",
                code="INVALID_MIME_TYPE", 
                status_code=400
            )
        
        file_bytes = await file.read()
        file_size = len(file_bytes)
        
        if file_size == 0:
            raise PackWiseException(message="One of the uploaded files is empty.", code="EMPTY_UPLOAD", status_code=400)
            
        if file_size > MAX_FILE_SIZE_BYTES:
            raise PackWiseException(message="One of the files exceeds the 10 MB limit.", code="FILE_TOO_LARGE", status_code=400)
        
        # Reset file cursor for storage service
        await file.seek(0)
    
    # 2. Storage
    storage_paths = []
    try:
        for file in files:
            path = await storage_service.save_upload(file)
            storage_paths.append(path)
    except Exception as e:
        # Clean up any files that were saved before the failure
        logger.error("File storage failed. Cleaning up partial uploads.")
        for path in storage_paths:
            storage_service.delete_file(path)
        raise PackWiseException(
            message="An error occurred while saving the uploaded files.",
            code="STORAGE_ERROR",
            status_code=500
        ) from e
    
    # 3. Database
    try:
        inspection = await create_inspection(db=db, storage_paths=storage_paths)
    except Exception as e:
        # 4. Cleanup on failure
        logger.error("Database operation failed after files were saved. Cleaning up files.")
        for path in storage_paths:
            storage_service.delete_file(path)
        
        if isinstance(e, PackWiseException):
            raise e
            
        raise PackWiseException(
            message="An unexpected error occurred during inspection creation.",
            code="INTERNAL_SERVER_ERROR",
            status_code=500
        ) from e

    # 5. Background Pipeline Orchestration
    # FastApi background task is triggered after the HTTP response completes.
    background_tasks.add_task(pipeline_service.run_inspection_pipeline, inspection.id)
    
    return inspection

@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection_endpoint(
    inspection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve an inspection by its ID.
    """
    inspection = await get_inspection(db, inspection_id)
    
    # Manually build response to map extracted_product.data to product_data
    response_data = InspectionResponse.model_validate(inspection).model_dump()
    if inspection.extracted_product:
        response_data["product_data"] = inspection.extracted_product.data
        
    return response_data

@router.get("/{inspection_id}/ocr", response_model=OCRResultResponse)
async def get_inspection_ocr_endpoint(
    inspection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the OCR result for an inspection.
    """
    ocr_result = await get_ocr_result(db, inspection_id)
    return ocr_result

@router.get("/{inspection_id}/compliance", response_model=ComplianceResultResponse)
async def get_inspection_compliance_endpoint(
    inspection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the Compliance result for an inspection.
    """
    compliance_result = await get_compliance_result(db, inspection_id)
    return compliance_result

