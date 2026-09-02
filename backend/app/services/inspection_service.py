import uuid
from typing import Any

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import PackWiseException
from app.core.logging import logger
from app.database.models import (
    ComplianceResult,
    ComplianceViolation,
    ExtractedProduct,
    Image,
    Inspection,
    InspectionStatus,
    OCRResult,
)
from app.schemas.extraction import ExtractedProductData


async def create_inspection(db: AsyncSession, storage_paths: list[str]) -> Inspection:
    """
    Creates an Inspection and its corresponding Images in the database.
    This service assumes the physical files have already been stored by the StorageService.
    """
    try:
        # Create a new UUID explicitly so we can associate the Image immediately
        inspection_id = uuid.uuid4()
        
        # Create Inspection
        new_inspection = Inspection(
            id=inspection_id,
            status=InspectionStatus.CREATED.value
        )
        db.add(new_inspection)
        
        # Create Images
        images_list = []
        for path in storage_paths:
            new_image = Image(
                id=uuid.uuid4(),
                inspection_id=inspection_id,
                storage_path=path,
                side=None # MVP: we are not collecting side yet from multipart forms easily for multiple files
            )
            db.add(new_image)
            images_list.append(new_image)
        
        # Commit transaction
        await db.commit()
        
        # Refresh to ensure created_at timestamps are loaded
        await db.refresh(new_inspection)
        
        logger.info(f"Successfully created Inspection {inspection_id} with {len(storage_paths)} Images")
        return await get_inspection(db, inspection_id)
        
    except Exception as e:
        # Rollback the transaction on failure
        await db.rollback()
        logger.error(f"Failed to create inspection in database: {e!s}")
        
        raise PackWiseException(
            message="Failed to create inspection record in the database.",
            code="DATABASE_ERROR",
            status_code=500
        ) from e

async def update_inspection_status(db: AsyncSession, inspection_id: uuid.UUID, new_status: InspectionStatus) -> None:
    """
    Updates the status of an inspection.
    Commits the transaction.
    """
    try:
        stmt = update(Inspection).where(Inspection.id == inspection_id).values(status=new_status.value)
        await db.execute(stmt)
        await db.commit()
        logger.info(f"Updated Inspection {inspection_id} status to {new_status.value}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update inspection status: {e!s}")
        raise PackWiseException(
            message="Database error while updating inspection status.",
            code="DATABASE_ERROR",
            status_code=500
        ) from e

async def save_ocr_result(db: AsyncSession, inspection_id: uuid.UUID, ocr_data: dict[str, Any]) -> None:
    """
    Saves the aggregated OCRResult for the inspection.
    """
    try:
        result = OCRResult(
            id=uuid.uuid4(),
            inspection_id=inspection_id,
            image_id=None, # Explicitly NULL as we aggregate from multiple images
            full_text=ocr_data.get("full_text"),
            regions=ocr_data.get("regions"),
            processing_status="COMPLETED"
        )
        db.add(result)
        await db.commit()
        logger.info(f"Saved OCR result for inspection {inspection_id}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save OCR result: {e!s}")
        raise PackWiseException(
            message="Database error while saving OCR result.",
            code="DATABASE_ERROR",
            status_code=500
        ) from e

async def save_extracted_product(db: AsyncSession, inspection_id: uuid.UUID, extracted_data: ExtractedProductData, original_nlp_data: ExtractedProductData = None) -> None:
    """
    Saves the NLP ExtractedProduct output.
    """
    try:
        # Pydantic model dumped to JSON compatible dict
        data_json = extracted_data.model_dump(mode="json")
        original_json = original_nlp_data.model_dump(mode="json") if original_nlp_data else None
        
        result = ExtractedProduct(
            id=uuid.uuid4(),
            inspection_id=inspection_id,
            data=data_json,
            original_nlp_data=original_json,
            confidence_score=extracted_data.confidence_score
        )
        db.add(result)
        await db.commit()
        logger.info(f"Saved ExtractedProduct for inspection {inspection_id}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save ExtractedProduct: {e!s}")
        raise PackWiseException(
            message="Database error while saving NLP extraction.",
            code="DATABASE_ERROR",
            status_code=500
        ) from e

async def save_compliance_result(db: AsyncSession, inspection_id: uuid.UUID, compliance_data: dict[str, Any], llm_verification: dict[str, Any] = None) -> None:
    """
    Saves the ComplianceResult and multiple ComplianceViolations.
    """
    try:
        result_id = uuid.uuid4()
        
        status = None
        message = None
        references = None
        
        if llm_verification:
            status = llm_verification.get("status")
            message = llm_verification.get("message")
            references = llm_verification.get("references")
            
        result = ComplianceResult(
            id=result_id,
            inspection_id=inspection_id,
            status=compliance_data.get("status", "FAIL"),
            score=compliance_data.get("score"),
            as_on_date=compliance_data.get("as_on_date"),
            total_penalty_exposure_inr=compliance_data.get("total_penalty_exposure_inr"),
            evaluated_rules=compliance_data.get("evaluated_rules", []),
            passed_rules=compliance_data.get("passed_rules", []),
            needs_review=compliance_data.get("needs_review", []),
            exempted=compliance_data.get("exempted", []),
            llm_verification_status=status,
            llm_verification_message=message,
            llm_verification_references=references
        )
        db.add(result)
        
        violations = compliance_data.get("violations", [])
        for v in violations:
            violation = ComplianceViolation(
                id=uuid.uuid4(),
                compliance_result_id=result_id,
                rule_id=v.get("rule_id"),
                rule_name=v.get("rule_name"),
                severity=v.get("severity"),
                message=v.get("message"),
                field=v.get("field"),
                detected_value=v.get("detected_value"),
                expected_requirement=v.get("expected_requirement"),
                evidence=v.get("evidence")
            )
            db.add(violation)
            
        await db.commit()
        logger.info(f"Saved ComplianceResult with {len(violations)} violations for inspection {inspection_id}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save ComplianceResult: {e!s}")
        raise PackWiseException(
            message="Database error while saving compliance result.",
            code="DATABASE_ERROR",
            status_code=500
        ) from e

async def get_inspection(db: AsyncSession, inspection_id: uuid.UUID) -> Inspection:
    """
    Retrieves an Inspection by ID, including its associated images.
    Raises a 404 PackWiseException if not found.
    """
    try:
        stmt = select(Inspection).options(
            selectinload(Inspection.images),
            selectinload(Inspection.extracted_product)
        ).where(Inspection.id == inspection_id)
        result = await db.execute(stmt)
        inspection = result.scalars().first()
        
        if not inspection:
            raise PackWiseException(message="Inspection not found.", code="INSPECTION_NOT_FOUND", status_code=404)
            
        return inspection
    except PackWiseException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve inspection {inspection_id}: {e!s}")
        raise PackWiseException(message="Database error while retrieving inspection.", code="DATABASE_ERROR", status_code=500) from e

async def get_ocr_result(db: AsyncSession, inspection_id: uuid.UUID) -> OCRResult:
    """
    Retrieves the OCRResult for an Inspection.
    Raises 404 if the inspection exists but OCR is not ready/doesn't exist.
    """
    # First ensure the inspection exists, otherwise 404 on the inspection itself
    await get_inspection(db, inspection_id)
    
    try:
        stmt = select(OCRResult).where(OCRResult.inspection_id == inspection_id)
        result = await db.execute(stmt)
        ocr = result.scalars().first()
        
        if not ocr:
            raise PackWiseException(message="OCR result not ready or not found.", code="OCR_NOT_READY", status_code=404)
            
        return ocr
    except PackWiseException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve OCR for inspection {inspection_id}: {e!s}")
        raise PackWiseException(message="Database error while retrieving OCR.", code="DATABASE_ERROR", status_code=500) from e

async def get_compliance_result(db: AsyncSession, inspection_id: uuid.UUID) -> ComplianceResult:
    """
    Retrieves the ComplianceResult for an Inspection, including its violations.
    Raises 404 if the inspection exists but Compliance is not ready/doesn't exist.
    """
    # First ensure the inspection exists
    await get_inspection(db, inspection_id)
    
    try:
        stmt = select(ComplianceResult).options(selectinload(ComplianceResult.violations)).where(ComplianceResult.inspection_id == inspection_id)
        result = await db.execute(stmt)
        compliance = result.scalars().first()
        
        if not compliance:
            raise PackWiseException(message="Compliance result not ready or not found.", code="COMPLIANCE_NOT_READY", status_code=404)
            
        return compliance
    except PackWiseException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve compliance for inspection {inspection_id}: {e!s}")
        raise PackWiseException(message="Database error while retrieving compliance.", code="DATABASE_ERROR", status_code=500) from e

