import uuid
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy import select

from app.core.exceptions import PackWiseException
from app.database.connection import async_session_factory
from app.database.models import (
    ComplianceResult,
    ExtractedProduct,
    Image,
    Inspection,
    InspectionStatus,
)
from app.schemas.extraction import ExtractedProductData, MetrologyData
from app.services.pipeline_service import pipeline_service


@pytest.fixture
def mock_ocr():
    with patch("app.services.pipeline_service.ocr_service.extract_text_from_images", new_callable=AsyncMock) as m:
        yield m

@pytest.fixture
def mock_nlp():
    with patch("app.services.pipeline_service.nlp_service.extract_from_ocr", new_callable=AsyncMock) as m:
        yield m

@pytest.fixture
def mock_llm_verification():
    with patch("app.services.pipeline_service.llm_verification_service.refine_product_data", new_callable=AsyncMock) as mp, \
         patch("app.services.pipeline_service.llm_verification_service.verify_compliance", new_callable=AsyncMock) as mc:
        yield mp, mc

@pytest.fixture
def mock_compliance():
    with patch("app.services.pipeline_service.compliance_service.evaluate_rules", new_callable=AsyncMock) as m:
        yield m

async def create_test_inspection(inspection_id: uuid.UUID):
    async with async_session_factory() as db:
        inspection = Inspection(id=inspection_id, status=InspectionStatus.CREATED.value)
        image = Image(id=uuid.uuid4(), inspection_id=inspection_id, storage_path="uploads/test_real.jpg")
        db.add(inspection)
        db.add(image)
        await db.commit()

async def cleanup_test_inspection(inspection_id: uuid.UUID):
    async with async_session_factory() as db:
        result = await db.execute(select(Inspection).where(Inspection.id == inspection_id))
        ins = result.scalars().first()
        if ins:
            await db.delete(ins)
            await db.commit()

@pytest.mark.anyio
async def test_pipeline_integration_success(mock_ocr, mock_nlp, mock_llm_verification, mock_compliance):
    mp, mc = mock_llm_verification
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    
    try:
        mock_ocr.return_value = {"full_text": "Sample text", "regions": [{"text": "Sample", "confidence": 0.99, "bbox": [0,0,100,100]}]}
        mock_nlp.return_value = ExtractedProductData(metrology=MetrologyData(brand_name="NLPBrand"), confidence_score=0.9)
        
        # 1. LLM Product Verification Succeeds -> refined data
        refined_data = ExtractedProductData(metrology=MetrologyData(brand_name="RefinedBrand"), confidence_score=0.95)
        mp.return_value = (refined_data, {})
        
        # Compliance Engine evaluation
        mock_compliance.return_value = {"status": "PASS", "evaluated_rules": [], "passed_rules": [], "violations": []}
        
        # 5. Compliance PASS + LLM Agrees -> PASS remains PASS
        mc.return_value = {"status": "AGREE", "message": "Looks good", "references": []}
        
        await pipeline_service.run_inspection_pipeline(inspection_id)
        
        async with async_session_factory() as db:
            result = await db.execute(select(Inspection).where(Inspection.id == inspection_id))
            inspection = result.scalars().first()
            assert inspection.status == InspectionStatus.COMPLETED.value
            
            # Check refined data reached DB
            nlp_result_db = await db.execute(select(ExtractedProduct).where(ExtractedProduct.inspection_id == inspection_id))
            nlp_row = nlp_result_db.scalars().first()
            assert nlp_row.data["metrology"]["brand_name"] == "RefinedBrand"
            assert nlp_row.original_nlp_data["metrology"]["brand_name"] == "NLPBrand"
            
            # Check compliance result
            comp_result_db = await db.execute(select(ComplianceResult).where(ComplianceResult.inspection_id == inspection_id))
            comp_row = comp_result_db.scalars().first()
            assert comp_row.status == "PASS"
            assert comp_row.llm_verification_status == "AGREE"
    finally:
        await cleanup_test_inspection(inspection_id)

@pytest.mark.anyio
async def test_pipeline_product_verification_fails_fallback(mock_ocr, mock_nlp, mock_llm_verification, mock_compliance):
    # 2. LLM product verification fails -> NLP data reaches compliance
    mp, mc = mock_llm_verification
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    
    try:
        mock_ocr.return_value = {"full_text": "Sample text", "regions": [{"text": "Sample", "confidence": 0.99, "bbox": [0,0,100,100]}]}
        mock_nlp.return_value = ExtractedProductData(metrology=MetrologyData(brand_name="NLPBrand"), confidence_score=0.9)
        
        # LLM Product verification fails
        mp.return_value = (mock_nlp.return_value, {})
        mock_compliance.return_value = {"status": "FAIL", "evaluated_rules": [], "passed_rules": [], "violations": []}
        mc.return_value = {"status": "AGREE"}
        
        await pipeline_service.run_inspection_pipeline(inspection_id)
        
        async with async_session_factory() as db:
            # Inspection should NOT fail
            result = await db.execute(select(Inspection).where(Inspection.id == inspection_id))
            inspection = result.scalars().first()
            assert inspection.status == InspectionStatus.COMPLETED.value
            
            # Check fallback to NLP data
            nlp_result_db = await db.execute(select(ExtractedProduct).where(ExtractedProduct.inspection_id == inspection_id))
            nlp_row = nlp_result_db.scalars().first()
            assert nlp_row.data["metrology"]["brand_name"] == "NLPBrand"
    finally:
        await cleanup_test_inspection(inspection_id)

@pytest.mark.anyio
async def test_pipeline_compliance_fails_llm_disagrees(mock_ocr, mock_nlp, mock_llm_verification, mock_compliance):
    # 8. Compliance engine FAIL + LLM disagrees -> FAIL remains FAIL + disagreement recorded
    mp, mc = mock_llm_verification
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    
    try:
        mock_ocr.return_value = {"full_text": "Sample text", "regions": [{"text": "Sample", "confidence": 0.99, "bbox": [0,0,100,100]}]}
        mock_nlp.return_value = ExtractedProductData(metrology=MetrologyData(brand_name="NLPBrand"), confidence_score=0.9)
        mp.return_value = (mock_nlp.return_value, {})
        
        mock_compliance.return_value = {"status": "FAIL", "evaluated_rules": [], "passed_rules": [], "violations": []}
        
        # LLM disagrees
        mc.return_value = {"status": "DISAGREE", "message": "Rule is outdated", "references": ["https://example.com/rule"]}
        
        await pipeline_service.run_inspection_pipeline(inspection_id)
        
        async with async_session_factory() as db:
            comp_result_db = await db.execute(select(ComplianceResult).where(ComplianceResult.inspection_id == inspection_id))
            comp_row = comp_result_db.scalars().first()
            
            # Status MUST remain FAIL
            assert comp_row.status == "FAIL"
            # Disagreement recorded
            assert comp_row.llm_verification_status == "DISAGREE"
            assert comp_row.llm_verification_message == "Rule is outdated"
            assert "https://example.com/rule" in comp_row.llm_verification_references
    finally:
        await cleanup_test_inspection(inspection_id)

@pytest.mark.anyio
async def test_pipeline_post_compliance_llm_failure(mock_ocr, mock_nlp, mock_llm_verification, mock_compliance):
    # 9. Post-compliance LLM failure -> deterministic result remains unchanged and inspection completes
    mp, mc = mock_llm_verification
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    
    try:
        mock_ocr.return_value = {"full_text": "Sample text", "regions": [{"text": "Sample", "confidence": 0.99, "bbox": [0,0,100,100]}]}
        mock_nlp.return_value = ExtractedProductData(metrology=MetrologyData(brand_name="NLPBrand"), confidence_score=0.9)
        mp.return_value = (mock_nlp.return_value, {})
        mock_compliance.return_value = {"status": "PASS", "evaluated_rules": [], "passed_rules": [], "violations": []}
        
        # LLM compliance verification fails
        mc.return_value = {"status": "UNVERIFIED", "message": "LLM verification failed or timed out. Deterministic result used.", "references": []}
        
        await pipeline_service.run_inspection_pipeline(inspection_id)
        
        async with async_session_factory() as db:
            result = await db.execute(select(Inspection).where(Inspection.id == inspection_id))
            assert result.scalars().first().status == InspectionStatus.COMPLETED.value
            
            comp_result_db = await db.execute(select(ComplianceResult).where(ComplianceResult.inspection_id == inspection_id))
            comp_row = comp_result_db.scalars().first()
            assert comp_row.status == "PASS"
            assert comp_row.llm_verification_status == "UNVERIFIED"
    finally:
        await cleanup_test_inspection(inspection_id)

@pytest.mark.anyio
async def test_pipeline_no_external_verification(mock_ocr, mock_nlp, mock_llm_verification, mock_compliance):
    # 10. No external verification -> UNVERIFIED, never fabricated information
    mp, mc = mock_llm_verification
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    
    try:
        mock_ocr.return_value = {"full_text": "Sample text", "regions": [{"text": "Sample", "confidence": 0.99, "bbox": [0,0,100,100]}]}
        mock_nlp.return_value = ExtractedProductData(metrology=MetrologyData(brand_name="NLPBrand"), confidence_score=0.9)
        mp.return_value = (mock_nlp.return_value, {})
        mock_compliance.return_value = {"status": "PASS", "evaluated_rules": [], "passed_rules": [], "violations": []}
        
        mc.return_value = {"status": "UNVERIFIED", "message": "Could not find rule online", "references": []}
        
        await pipeline_service.run_inspection_pipeline(inspection_id)
        
        async with async_session_factory() as db:
            comp_result_db = await db.execute(select(ComplianceResult).where(ComplianceResult.inspection_id == inspection_id))
            comp_row = comp_result_db.scalars().first()
            assert comp_row.status == "PASS"
            assert comp_row.llm_verification_status == "UNVERIFIED"
    finally:
        await cleanup_test_inspection(inspection_id)

@pytest.mark.anyio
async def test_pipeline_ocr_failure(mock_ocr):
    inspection_id = uuid.uuid4()
    await create_test_inspection(inspection_id)
    try:
        mock_ocr.side_effect = PackWiseException(message="OCR Failed", code="OCR_FAIL", status_code=500)
        await pipeline_service.run_inspection_pipeline(inspection_id)
        async with async_session_factory() as db:
            result = await db.execute(select(Inspection).where(Inspection.id == inspection_id))
            inspection = result.scalars().first()
            assert inspection.status == InspectionStatus.FAILED.value
    finally:
        await cleanup_test_inspection(inspection_id)
