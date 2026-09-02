import time
import uuid

from pydantic import ValidationError

from app.core.exceptions import PackWiseException
from app.core.logging import logger
from app.database.connection import async_session_factory
from app.database.models import InspectionStatus
from app.schemas.extraction import OCRResult
from app.services.compliance_service import compliance_service
from app.services.inspection_service import (
    get_inspection,
    save_compliance_result,
    save_extracted_product,
    save_ocr_result,
    update_inspection_status,
)
from app.services.llm_verification_service import llm_verification_service
from app.services.nlp_service import nlp_service
from app.services.ocr_service import ocr_service


class PipelineService:
    async def run_inspection_pipeline(self, inspection_id: uuid.UUID) -> None:
        """
        Background orchestrator:
          Image → OCR → Deterministic NLP → Optional LLM Refinement
               → Deterministic Compliance → Optional LLM Advisory → DB → COMPLETED
        """
        logger.info(f"PIPELINE_START inspection={inspection_id}")
        timings: dict[str, float] = {}

        try:
            pipeline_start = time.perf_counter()
            async with async_session_factory() as db:
                # 1. PROCESSING
                await update_inspection_status(db, inspection_id, InspectionStatus.PROCESSING)

                inspection = await get_inspection(db, inspection_id)
                image_paths = [img.storage_path for img in inspection.images]

                if not image_paths:
                    logger.warning(f"Inspection {inspection_id} has no images.")

                # ── 2. OCR ──────────────────────────────────────────────
                t0 = time.perf_counter()
                ocr_data = await ocr_service.extract_text_from_images(image_paths)
                timings["ocr"] = (time.perf_counter() - t0) * 1000

                try:
                    validated_ocr = OCRResult(**ocr_data)
                except ValidationError as e:
                    logger.error(f"OCR validation failed: {e}")
                    raise PackWiseException(
                        message="OCR output failed schema validation.",
                        code="OCR_VALIDATION_ERROR",
                        status_code=500,
                    ) from e

                await save_ocr_result(db, inspection_id, validated_ocr.model_dump())

                # ── 3. Deterministic NLP ────────────────────────────────
                full_text = ocr_data.get("full_text", "")
                t0 = time.perf_counter()
                nlp_data = await nlp_service.extract_from_ocr(full_text)
                timings["nlp"] = (time.perf_counter() - t0) * 1000

                # ── 4. Optional LLM Refinement ─────────────────────────
                t0 = time.perf_counter()
                verified_data, field_sources = await llm_verification_service.refine_product_data(
                    full_text, nlp_data, image_paths=image_paths
                )
                timings["llm_refinement"] = (time.perf_counter() - t0) * 1000

                # Log field sources
                m = verified_data.metrology
                src_log_parts = [
                    f"MRP={m.mrp}(src={field_sources.get('mrp', '?')})",
                    f"BB={m.best_before}(src={field_sources.get('best_before', '?')})",
                    f"NetQty={m.net_quantity}(src={field_sources.get('net_quantity', '?')})",
                    f"Mfr={bool(m.manufacturer_details)}(src={field_sources.get('manufacturer_details', '?')})",
                ]
                fssai_val = verified_data.packaging.fssai_license_number if verified_data.packaging else None
                src_log_parts.append(
                    f"FSSAI={fssai_val}(src={field_sources.get('fssai_license_number', '?')})"
                )
                logger.info(f"FIELD_SOURCES {' | '.join(src_log_parts)}")

                await save_extracted_product(
                    db, inspection_id, verified_data, original_nlp_data=nlp_data
                )

                # ── 5. Deterministic Compliance ────────────────────────
                t0 = time.perf_counter()
                compliance_data = await compliance_service.evaluate_rules(verified_data)
                timings["compliance"] = (time.perf_counter() - t0) * 1000

                try:
                    from app.schemas.compliance import ComplianceResultCreate
                    validated_compliance = ComplianceResultCreate(**compliance_data)
                except ValidationError as e:
                    logger.error(f"Compliance validation failed: {e}")
                    raise PackWiseException(
                        message="Compliance output failed schema validation.",
                        code="COMPLIANCE_VALIDATION_ERROR",
                        status_code=500,
                    ) from e

                # ── 6. Optional LLM Advisory ───────────────────────────
                t0 = time.perf_counter()
                llm_advisory = await llm_verification_service.verify_compliance(
                    full_text, verified_data, validated_compliance
                )
                timings["llm_advisory"] = (time.perf_counter() - t0) * 1000

                # ── 7. Save to DB ──────────────────────────────────────
                t0 = time.perf_counter()
                await save_compliance_result(
                    db, inspection_id, validated_compliance.model_dump(),
                    llm_verification=llm_advisory,
                )
                timings["database"] = (time.perf_counter() - t0) * 1000

                # ── 8. COMPLETED ───────────────────────────────────────
                await update_inspection_status(db, inspection_id, InspectionStatus.COMPLETED)
                timings["total"] = (time.perf_counter() - pipeline_start) * 1000

                timing_str = " | ".join(f"{k}={v:.0f}ms" for k, v in timings.items())
                logger.info(f"PIPELINE_COMPLETE inspection={inspection_id} {timing_str}")

        except PackWiseException as e:
            logger.error(
                f"Pipeline failed [{e.code}]: {e.message} (inspection={inspection_id})"
            )
            await self._set_failed_status(inspection_id)

        except Exception as e:
            logger.exception(
                f"Pipeline failed unexpectedly: {e} (inspection={inspection_id})"
            )
            await self._set_failed_status(inspection_id)

    async def _set_failed_status(self, inspection_id: uuid.UUID) -> None:
        try:
            async with async_session_factory() as fresh_db:
                await update_inspection_status(
                    fresh_db, inspection_id, InspectionStatus.FAILED
                )
                logger.info(f"Marked inspection {inspection_id} as FAILED.")
        except Exception as e:
            logger.error(
                f"CRITICAL: Could not mark {inspection_id} as FAILED: {e}"
            )


pipeline_service = PipelineService()
