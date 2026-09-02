import asyncio
import json
import os
from typing import Any

from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import logger
from app.schemas.compliance import ComplianceResultCreate
from app.schemas.extraction import ExtractedProductData, MetrologyData


class LLMProductExtraction(BaseModel):
    metrology: MetrologyData
    nutrition: Any | None = None
    packaging: Any | None = None


class LLMVerificationService:
    """
    Optional LLM refinement and advisory layer.
    All methods are designed to NEVER raise — they return fallback data on any failure.
    """
    
    def __init__(self):
        self.client = None
        try:
            from google import genai
            if settings.GEMINI_API_KEY:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        except ImportError:
            logger.error("google-genai dependency is not installed.")

    PROTECTED_FIELDS = frozenset([
        'mrp', 'best_before', 'expiry_date', 'manufacturing_date',
        'mfg_date', 'net_quantity', 'packing_date',
    ])

    def _merge_nlp_with_llm(
        self, nlp_data: ExtractedProductData, llm_data: ExtractedProductData
    ) -> tuple[ExtractedProductData, dict]:
        """
        Merge LLM refinement into NLP data with field-level protection.
        Returns (merged_data, field_sources) where field_sources maps field->source.
        """
        result_metrology = nlp_data.metrology.model_copy()
        llm_metrology = llm_data.metrology
        field_sources: dict[str, str] = {}

        for field in result_metrology.model_fields:
            nlp_value = getattr(result_metrology, field)
            llm_value = getattr(llm_metrology, field)

            # Default source is NLP (or NONE if both are empty)
            if nlp_value is not None:
                field_sources[field] = "NLP"
            else:
                field_sources[field] = "NONE"

            # LLM has a non-empty, non-null value
            if (
                llm_value is not None
                and str(llm_value).strip() != ""
                and str(llm_value).strip().lower() != "null"
            ):
                if field in self.PROTECTED_FIELDS and nlp_value is not None:
                    # Protected field: only upgrade, never erase
                    field_sources[field] = "NLP"  # NLP value preserved
                else:
                    setattr(result_metrology, field, llm_value)
                    field_sources[field] = "LLM_REFINED"
            # else: keep NLP value (no overwrite)

        # Merge packaging (FSSAI)
        merged_packaging = nlp_data.packaging if nlp_data.packaging else llm_data.packaging
        if nlp_data.packaging and llm_data.packaging:
            nlp_fssai = nlp_data.packaging.fssai_license_number
            llm_fssai = llm_data.packaging.fssai_license_number
            
            if nlp_fssai:
                # Protect NLP FSSAI value unconditionally
                merged_packaging.fssai_license_number = nlp_fssai
                field_sources["fssai_license_number"] = "NLP"
            elif llm_fssai and str(llm_fssai).strip().lower() not in ("null", "none", ""):
                merged_packaging.fssai_license_number = llm_fssai
                field_sources["fssai_license_number"] = "LLM_REFINED"
        elif nlp_data.packaging and nlp_data.packaging.fssai_license_number:
            field_sources["fssai_license_number"] = "NLP"
        elif llm_data.packaging and llm_data.packaging.fssai_license_number:
            if str(llm_data.packaging.fssai_license_number).strip().lower() not in ("null", "none", ""):
                field_sources["fssai_license_number"] = "LLM_REFINED"
            else:
                llm_data.packaging.fssai_license_number = None

        return ExtractedProductData(
            metrology=result_metrology,
            nutrition=llm_data.nutrition if llm_data.nutrition else nlp_data.nutrition,
            packaging=merged_packaging,
            confidence_score=max(nlp_data.confidence_score, llm_data.confidence_score),
            raw_ocr_length=nlp_data.raw_ocr_length,
            extracted_fields_count=max(nlp_data.extracted_fields_count, llm_data.extracted_fields_count),
            total_supported_fields=nlp_data.total_supported_fields,
            warnings=(nlp_data.warnings or []) + (llm_data.warnings or []),
        ), field_sources

    # ── LLM Product Refinement ──────────────────────────────────────────

    def _refine_product_data_sync(self, ocr_text: str, nlp_data_json: str, image_paths: list[str] = None) -> dict:
        prompt = f"""
        You are an expert product data extraction assistant for Indian food packaging.
        You are given the product packaging image(s) AND OCR text extracted from them.
        
        Your task: Extract ALL mandatory labelling fields from the image.
        The OCR text may be incomplete or contain errors — USE THE IMAGE as your primary source.
        
        CRITICAL RULES:
        1. Read the actual image carefully for MRP, Net Weight, Best Before, FSSAI, Manufacturer, etc.
        2. Extract MRP as just the number (e.g. "10" not "MRP Rs. 10").
        3. Extract Net Quantity with units (e.g. "22g", "100 ml").
        4. Extract FSSAI license number — it's a 14-digit number near the FSSAI logo.
        5. Extract manufacturer name and address.
        6. Extract packing date (PKD) and expiry date if visible.
        7. Extract Best Before — if it says "Best Before X months from packaging" return that text.
        8. Extract consumer care phone/email if visible.
        9. Do NOT invent data that is not on the package.
        
        OCR Text (may be incomplete):
        {ocr_text}
        
        Previous NLP Extraction (may be incomplete):
        {nlp_data_json}
        """

        if not self.client:
            return {"error": "GenAI client not initialized"}

        try:
            import io

            from google.genai import types
            from PIL import Image
            
            # Build multimodal content: image(s) + text prompt
            contents = []
            if image_paths:
                for img_path in image_paths[:2]:  # Max 2 images
                    try:
                        with Image.open(img_path) as img:
                            img.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
                            img_byte_arr = io.BytesIO()
                            img.save(img_byte_arr, format='JPEG', quality=85)
                            img_bytes = img_byte_arr.getvalue()
                        contents.append(types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'))
                    except Exception as e:
                        logger.warning(f"Failed to load/resize image for LLM: {e}")
            contents.append(prompt)

            config = types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=LLMProductExtraction
            )
            response = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=contents,
                config=config
            )
            return json.loads(response.text)

        except json.JSONDecodeError as e:
            logger.error(f"GenAI returned invalid JSON in product refinement: {e}")
            raise
        except Exception as e:
            logger.error(f"GenAI API call failed in product refinement: {e}")
            raise

    async def refine_product_data(
        self, ocr_text: str, nlp_data: ExtractedProductData, image_paths: list[str] = None
    ) -> tuple[ExtractedProductData, dict]:
        """
        Attempt LLM refinement with a hard wall-clock timeout.
        Returns (refined_data, field_sources).
        On ANY failure, returns (nlp_data, {field: "NLP"}).
        """
        default_sources = {
            f: ("NLP" if getattr(nlp_data.metrology, f) is not None else "NONE")
            for f in nlp_data.metrology.model_fields
        }

        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Skipping LLM refinement.")
            return nlp_data, default_sources

        timeout = int(os.environ.get("LLM_REFINEMENT_TIMEOUT_SECONDS", 15))
        nlp_data_json = nlp_data.model_dump_json()

        try:
            raw_result = await asyncio.wait_for(
                run_in_threadpool(self._refine_product_data_sync, ocr_text, nlp_data_json, image_paths),
                timeout=timeout,
            )
            if "error" in raw_result:
                raise Exception(raw_result["error"])

            extraction = LLMProductExtraction(**raw_result)

            llm_extracted = ExtractedProductData(
                metrology=extraction.metrology,
                nutrition=extraction.nutrition,
                packaging=extraction.packaging,
                confidence_score=nlp_data.confidence_score,
                raw_ocr_length=nlp_data.raw_ocr_length,
                extracted_fields_count=nlp_data.extracted_fields_count,
                total_supported_fields=nlp_data.total_supported_fields,
                warnings=nlp_data.warnings,
            )

            logger.info("LLM refinement succeeded. Merging with NLP data.")
            merged, sources = self._merge_nlp_with_llm(nlp_data, llm_extracted)
            return merged, sources

        except asyncio.TimeoutError:
            logger.warning(f"LLM refinement timed out after {timeout}s. Using NLP data.")
        except Exception as e:
            logger.warning(f"LLM refinement failed: {e}. Using NLP data.")

        if not nlp_data.warnings:
            nlp_data.warnings = []
        nlp_data.warnings.append("LLM refinement unavailable; deterministic NLP result used.")
        return nlp_data, default_sources

    # ── LLM Compliance Advisory ─────────────────────────────────────────

    def _verify_compliance_sync(
        self, ocr_text: str, product_data_json: str, deterministic_result_json: str
    ) -> dict:
        prompt = f"""
        You are an expert Legal Metrology compliance verification assistant.
        A deterministic compliance engine has evaluated the product data and produced a compliance result.
        Your task is ONLY to verify if the deterministic compliance result appears consistent with applicable publicly available Legal Metrology rules.
        
        CRITICAL RULES:
        1. Review the 'Deterministic Result' based on the 'Product Data' and 'OCR Text'.
        2. Use Google Search to look up the relevant Legal Metrology packaging rules online if needed.
        3. Do NOT change the pass/fail result. You are an advisory cross-check ONLY.
        4. If the deterministic result appears correct, status = "AGREE".
        5. If the deterministic result appears incorrect or cites outdated rules, status = "DISAGREE".
        6. If you cannot confidently verify the rules online, status = "UNVERIFIED".
        7. Provide a concise message explaining your findings.
        
        OCR Text:
        {ocr_text}
        
        Product Data:
        {product_data_json}
        
        Deterministic Result:
        {deterministic_result_json}
        """

        class ComplianceVerificationSchema(BaseModel):
            status: str
            message: str
            references: list[str] | None = None

        if not self.client:
            return {"status": "UNVERIFIED", "message": "GenAI client not initialized"}

        try:
            from google.genai import types

            config = types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=ComplianceVerificationSchema,
                tools=[{"google_search": {}}]
            )
            response = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt,
                config=config
            )

            result = json.loads(response.text)

            # Extract grounding references
            references = result.get("references", [])
            try:
                if hasattr(response, 'candidates') and response.candidates:
                    gm = response.candidates[0].grounding_metadata
                    if gm and gm.grounding_chunks:
                        for chunk in gm.grounding_chunks:
                            if hasattr(chunk, 'web') and hasattr(chunk.web, 'uri'):
                                if chunk.web.uri not in references:
                                    references.append(chunk.web.uri)
                result["references"] = references
            except Exception as e:
                logger.warning(f"Failed to extract search references: {e}")

            return result
        except Exception as e:
            logger.error(f"GenAI compliance advisory failed: {e}")
            raise

    async def verify_compliance(
        self,
        ocr_text: str,
        product_data: ExtractedProductData,
        deterministic_result: ComplianceResultCreate,
    ) -> dict:
        """
        Advisory cross-check with hard wall-clock timeout.
        Returns a status dict; NEVER raises.
        """
        unverified = {
            "status": "UNVERIFIED",
            "message": "LLM verification failed or timed out. Deterministic result used.",
            "references": [],
        }

        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Skipping advisory.")
            unverified["message"] = "LLM advisory unavailable (no API key)."
            return unverified

        timeout = int(os.environ.get("LLM_ADVISORY_TIMEOUT_SECONDS", 8))

        try:
            result = await asyncio.wait_for(
                run_in_threadpool(
                    self._verify_compliance_sync,
                    ocr_text,
                    product_data.model_dump_json(),
                    deterministic_result.model_dump_json(),
                ),
                timeout=timeout,
            )
            return result
        except asyncio.TimeoutError:
            logger.warning(f"LLM advisory timed out after {timeout}s.")
            return unverified
        except Exception as e:
            logger.warning(f"LLM advisory failed: {e}.")
            return unverified


llm_verification_service = LLMVerificationService()
