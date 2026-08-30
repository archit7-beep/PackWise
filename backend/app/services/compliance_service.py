from __future__ import annotations

import re
from typing import Any, Dict

from app.core.logging import logger
from app.schemas.extraction import ExtractedProductData
from app.services.compliance import load_exemptions, load_rules, run_compliance_check

_RULES = load_rules()
_EXEMPTIONS = load_exemptions()

_NOT_YET_SUPPORTED_RULE_IDS = {"LMPC-R9-LANGUAGE", "LMPC-R9-CONTRAST", "LMPC-R6-UNITPRICE"}
_ACTIVE_RULES = [r for r in _RULES if r.id not in _NOT_YET_SUPPORTED_RULE_IDS]


def _parse_net_quantity(raw):
    if not raw:
        return "", ""
    m = re.match(r"^\s*([\d.]+)\s*([a-zA-Z]+)\s*$", raw)
    if not m:
        return raw, ""
    return m.group(1), m.group(2).lower()


def _normalise_date(raw):
    if not raw:
        return ""
    m = re.match(r"^(\d{4})-(\d{2})-\d{2}$", raw.strip())
    if m:
        return f"{m.group(2)}/{m.group(1)}"
    return raw.strip()


def _map_to_engine_fields(data: ExtractedProductData) -> dict:
    m = data.metrology
    qty_val, qty_unit = _parse_net_quantity(m.net_quantity)
    conf = data.confidence_score if data.confidence_score > 0 else 1.0

    def f(value):
        return {"value": value, "confidence": conf, "bbox": None}

    manufacturer_combined = m.manufacturer_details or m.packer_details or m.importer_details or ""

    fields = {
        "manufacturer_name_address": f(manufacturer_combined),
        "generic_name": f(m.generic_name_of_commodity or ""),
        "net_quantity": f(qty_val),
        "net_quantity_unit": f(qty_unit),
        "mrp": f(m.mrp if m.mrp is not None else ""),
        "mfg_month_year": f(_normalise_date(m.mfg_date)),
        "consumer_care": f(m.consumer_care_contact or ""),
        "country_of_origin": f(m.country_of_origin or ""),
    }
    if data.packaging:
        fields["fssai_license_number"] = f(data.packaging.fssai_license_number or "")

    return fields


def _map_product_context(data: ExtractedProductData) -> dict:
    m = data.metrology
    is_imported = bool(m.country_of_origin) or bool(m.importer_details)
    category = "food" if data.nutrition is not None else "general"
    return {"category": category, "is_imported": is_imported}


def _violation_to_dict(v) -> dict:
    return {
        "rule_id": v.rule_id,
        "rule_name": v.title,
        "severity": v.severity,
        "message": v.explanation,
        "field": v.rule_id,
        "detected_value": v.found,
        "expected_requirement": v.legal_basis,
        "evidence": {
            "suggested_fix": v.suggested_fix,
            "penalty_exposure": v.penalty,
            "confidence": v.confidence,
        },
    }


class ComplianceService:
    async def evaluate_rules(self, extracted_data: ExtractedProductData) -> Dict[str, Any]:
        logger.info("Running Compliance Subsystem (LMPC rules engine).")

        fields = _map_to_engine_fields(extracted_data)
        product = _map_product_context(extracted_data)

        result = run_compliance_check(product, fields, rules=_ACTIVE_RULES, exemptions=_EXEMPTIONS)

        return {
            "status": result.verdict,
            "score": result.score,
            "as_on_date": result.as_on_date,
            "total_penalty_exposure_inr": result.total_penalty_exposure_inr,
            "evaluated_rules": [r.id for r in _ACTIVE_RULES],
            "passed_rules": [v.rule_id for v in result.passed_checks],
            "violations": [_violation_to_dict(v) for v in result.violations],
            "needs_review": [_violation_to_dict(v) for v in result.needs_review_checks],
            "exempted": [_violation_to_dict(v) for v in result.exempted_checks],
        }


compliance_service = ComplianceService()
