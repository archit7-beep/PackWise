"""
The compliance validation engine.

Input field shape (from OCR/NLP extraction):
    {
        "manufacturer_name_address": {"value": "...", "confidence": 0.94, "bbox": [12,50,300,90]},
        "mrp": {"value": 149, "confidence": 0.97, "bbox": [...]},
        ...
    }
A plain value (not a dict) is also accepted for manual-entry mode or unit
tests -- it's normalised to {"value": v, "confidence": 1.0, "bbox": None}.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field as dc_field
from datetime import date

from .loader import load_exemptions, load_rules
from .schema import ExemptionSchema, PenaltyTiers, RuleSchema, Severity

# ---------------------------------------------------------------------------
# Field normalisation
# ---------------------------------------------------------------------------


def _normalise(raw_fields: dict) -> dict:
    out = {}
    for k, v in (raw_fields or {}).items():
        if isinstance(v, dict) and "value" in v:
            out[k] = {"value": v.get("value"), "confidence": v.get("confidence", 1.0), "bbox": v.get("bbox")}
        else:
            out[k] = {"value": v, "confidence": 1.0, "bbox": None}
    return out


# ---------------------------------------------------------------------------
# Individual field validators
# ---------------------------------------------------------------------------


def _field_present_non_empty(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    value = str(values.get(rule.field) or "").strip()
    if value:
        return True, value, f"'{rule.field}' is present."
    return False, "(missing)", f"Required field '{rule.field}' was not found on the label."


def _field_present_numeric_positive(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    raw = values.get(rule.field)
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return False, str(raw), f"'{rule.field}' must be a positive number; found '{raw}'."
    if value > 0:
        return True, str(value), f"'{rule.field}' = {value}, a valid positive value."
    return False, str(value), f"'{rule.field}' must be greater than zero; found {value}."


def _field_present_date(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    raw = str(values.get(rule.field) or "").strip()
    if not raw:
        return False, "(missing)", f"Required date field '{rule.field}' was not found."
    if (
        re.match(r"^(0[1-9]|1[0-2])/\d{4}$", raw)
        or re.match(r"^[A-Za-z]+\s\d{4}$", raw)
        or re.match(r"^\d{4}$", raw)
    ):
        return True, raw, f"'{rule.field}' = '{raw}', a recognisable month/year format."
    return False, raw, (
        f"'{rule.field}' = '{raw}' is not in a recognisable month/year format "
        f"(expected e.g. '03/2026' or 'March 2026')."
    )


def _net_quantity_standard_unit(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    qty = values.get("net_quantity")
    unit = str(values.get("net_quantity_unit") or "").strip().lower()
    allowed = rule.params.get("allowed_units", [])
    if qty is None or str(qty).strip() == "":
        return False, "(missing)", "Net quantity value is missing."
    try:
        qty_val = float(qty)
    except (TypeError, ValueError):
        return False, str(qty), f"Net quantity '{qty}' is not numeric."
    if qty_val <= 0:
        return False, str(qty), f"Net quantity must be positive; found {qty_val}."
    if unit not in allowed:
        return False, f"{qty_val} {unit}", (
            f"Declared unit '{unit}' is not a standard unit under Rule 8 (expected one of {allowed})."
        )
    return True, f"{qty_val} {unit}", f"Net quantity declared as {qty_val} {unit}, a standard unit."


def _language_or_check(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    langs = values.get(rule.field) or []
    if isinstance(langs, str):
        langs = [l.strip().lower() for l in langs.split(",") if l.strip()]
    else:
        langs = [str(l).strip().lower() for l in langs]
    acceptable = set(rule.params.get("acceptable_any_of", []))
    if acceptable & set(langs):
        return True, ", ".join(langs) or "(none)", (
            f"Declaration language(s) {langs} satisfy the Hindi-OR-English requirement (Rule 9(2))."
        )
    return False, ", ".join(langs) or "(none)", (
        f"Neither Hindi nor English detected among declared languages {langs}; Rule 9(2) requires at least one."
    )


def _ecommerce_declarations_present(values: dict, rule: RuleSchema) -> tuple[bool, str, str]:
    missing = [f for f in rule.required_fields if not str(values.get(f) or "").strip()]
    if not missing:
        return True, "all required fields present", (
            "All Rule 6(1) declarations required for e-commerce listings are present "
            "(month/year of manufacture correctly not required on the listing)."
        )
    return False, f"missing: {missing}", (
        f"E-commerce listing is missing required declarations: {missing}. "
        f"Note: mfg_month_year is correctly excluded from this check per Rule 6(10)."
    )


VALIDATORS = {
    "field_present_non_empty": _field_present_non_empty,
    "field_present_numeric_positive": _field_present_numeric_positive,
    "field_present_date": _field_present_date,
    "net_quantity_standard_unit": _net_quantity_standard_unit,
    "language_or_check": _language_or_check,
    "ecommerce_declarations_present": _ecommerce_declarations_present,
}

SEVERITY_WEIGHT = {Severity.critical: 40, Severity.major: 15, Severity.minor: 5}


def evaluate_single_rule(rule: RuleSchema, raw_fields: dict) -> tuple[str, str, str, float, list | None]:
    values_only = {k: v["value"] for k, v in _normalise(raw_fields).items()}
    validator_fn = VALIDATORS[rule.validation_type]
    passed, found, explanation = validator_fn(values_only, rule)

    norm = _normalise(raw_fields)
    primary_field = rule.field or (rule.required_fields[0] if rule.required_fields else None)
    conf = norm.get(primary_field, {}).get("confidence", 1.0) if primary_field else 1.0
    bbox = norm.get(primary_field, {}).get("bbox") if primary_field else None

    return ("pass" if passed else "fail"), found, explanation, conf, bbox


# ---------------------------------------------------------------------------
# Temporal (as-on-date) helpers
# ---------------------------------------------------------------------------


def _rule_in_force(rule: RuleSchema, as_on_date: date) -> bool:
    if as_on_date < rule.effective_from:
        return False
    if rule.effective_until and as_on_date > rule.effective_until:
        return False
    return True


def _why_not_in_force(rule: RuleSchema, as_on_date: date) -> str:
    if as_on_date < rule.effective_from:
        return (
            f"{rule.rule_ref} — effective from {rule.effective_from}, "
            f"not yet in force as of {as_on_date}."
        )
    return (
        f"{rule.rule_ref} — superseded on {rule.effective_until}, "
        f"no longer in force as of {as_on_date}."
    )


# ---------------------------------------------------------------------------
# Exemption resolution (temporal-aware)
# ---------------------------------------------------------------------------


def _rule_is_exempt(
    rule: RuleSchema, product: dict, exemptions: list[ExemptionSchema], as_on_date: date
) -> tuple[bool, str]:
    exemption_by_id = {e.id: e for e in exemptions}
    for ref in rule.exemption_refs:
        group = exemption_by_id.get(ref)
        if not group:
            continue
        for cond in group.conditions:
            if cond.effective_from and as_on_date < cond.effective_from:
                continue  # this exemption condition didn't exist yet on as_on_date
            if product.get(cond.key) is True:
                if product.get("category", "") in cond.exclude_categories:
                    continue
                return True, f"{group.rule_ref} — {cond.description}"
    return False, ""


# ---------------------------------------------------------------------------
# Fix suggestions
# ---------------------------------------------------------------------------


def _suggest_fix(rule: RuleSchema, found: str) -> str:
    if rule.fix_example:
        return f"Add/correct '{rule.field or rule.title}' — example: {rule.fix_example}"
    return f"Review and correct '{rule.field or rule.title}' per {rule.rule_ref}."


# ---------------------------------------------------------------------------
# Penalty exposure
# ---------------------------------------------------------------------------


def _penalty_for(tiers: PenaltyTiers, offence_count: int) -> dict:
    if offence_count <= 0:
        tier, lo, hi, months = "first", tiers.first_offence_min, tiers.first_offence_max, None
    elif offence_count == 1:
        tier, lo, hi, months = "second", tiers.second_offence_min, tiers.second_offence_max, None
    else:
        tier, lo, hi, months = (
            "subsequent",
            tiers.subsequent_offence_min,
            tiers.subsequent_offence_max,
            tiers.subsequent_imprisonment_months_max,
        )
    return {
        "offence_tier": tier,
        "fine_min_inr": lo,
        "fine_max_inr": hi,
        "imprisonment_months_max": months,
        "basis": tiers.basis,
    }


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------


@dataclass
class Violation:
    rule_id: str
    rule_ref: str
    title: str
    severity: str
    status: str
    found: str
    explanation: str
    legal_basis: str
    confidence: float
    bbox: list | None
    penalty: dict | None
    suggested_fix: str | None = None

    def to_contract_dict(self) -> dict:
        return {
            "rule_id": self.rule_id,
            "rule_ref": self.rule_ref,
            "title": self.title,
            "severity": self.severity,
            "status": self.status,
            "message": self.explanation,
            "evidence": [f"Found: {self.found}", f"Confidence: {self.confidence:.2f}"],
            "source_bbox": self.bbox,
            "field_confidence": self.confidence,
            "penalty_exposure": self.penalty,
            "legal_basis": self.legal_basis,
            "suggested_fix": self.suggested_fix,
        }


@dataclass
class ComplianceResult:
    verdict: str
    score: int
    as_on_date: str = ""
    violations: list[Violation] = dc_field(default_factory=list)
    passed_checks: list[Violation] = dc_field(default_factory=list)
    needs_review_checks: list[Violation] = dc_field(default_factory=list)
    exempted_checks: list[Violation] = dc_field(default_factory=list)
    not_yet_in_force_checks: list[Violation] = dc_field(default_factory=list)
    total_penalty_exposure_inr: int = 0

    def to_contract_dict(self) -> dict:
        return {
            "verdict": self.verdict,
            "score": self.score,
            "as_on_date": self.as_on_date,
            "violations": [v.to_contract_dict() for v in self.violations],
            "passed_checks": [v.to_contract_dict() for v in self.passed_checks],
            "needs_review_checks": [v.to_contract_dict() for v in self.needs_review_checks],
            "exempted_checks": [v.to_contract_dict() for v in self.exempted_checks],
            "not_yet_in_force_checks": [v.to_contract_dict() for v in self.not_yet_in_force_checks],
            "total_penalty_exposure_inr": self.total_penalty_exposure_inr,
        }


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------


def run_compliance_check(
    product: dict,
    fields: dict,
    rules: list[RuleSchema] | None = None,
    exemptions: list[ExemptionSchema] | None = None,
    as_on_date: date | None = None,
) -> ComplianceResult:
    rules = rules if rules is not None else load_rules()
    exemptions = exemptions if exemptions is not None else load_exemptions()
    offence_history = product.get("offence_history", {})
    as_on_date = as_on_date or date.today()

    result = ComplianceResult(verdict="compliant", score=100, as_on_date=as_on_date.isoformat())
    max_deduction = 0
    actual_deduction = 0
    total_penalty = 0

    for rule in rules:
        applies = "all" in rule.applies_to_categories or product.get("category") in rule.applies_to_categories
        if not applies:
            continue
        if rule.condition == "is_imported == true" and not product.get("is_imported"):
            continue

        if not _rule_in_force(rule, as_on_date):
            result.not_yet_in_force_checks.append(
                Violation(
                    rule_id=rule.id, rule_ref=rule.rule_ref, title=rule.title,
                    severity=rule.default_severity.value, status="not_yet_in_force",
                    found="N/A", explanation=_why_not_in_force(rule, as_on_date),
                    legal_basis=rule.act_basis or rule.rule_ref, confidence=1.0, bbox=None, penalty=None,
                )
            )
            continue

        is_exempt, exempt_reason = _rule_is_exempt(rule, product, exemptions, as_on_date)
        weight = SEVERITY_WEIGHT[rule.default_severity]

        if is_exempt:
            result.exempted_checks.append(
                Violation(
                    rule_id=rule.id, rule_ref=rule.rule_ref, title=rule.title,
                    severity=rule.default_severity.value, status="exempt",
                    found="N/A (exempt)", explanation=f"Exempt under {exempt_reason}.",
                    legal_basis=rule.act_basis or rule.rule_ref, confidence=1.0, bbox=None, penalty=None,
                )
            )
            continue

        status, found, explanation, confidence, bbox = evaluate_single_rule(rule, fields)
        max_deduction += weight

        if status == "fail" and confidence < rule.confidence_threshold:
            status = "needs_review"

        v = Violation(
            rule_id=rule.id, rule_ref=rule.rule_ref, title=rule.title,
            severity=rule.default_severity.value, status=status,
            found=found, explanation=explanation,
            legal_basis=f"{rule.act_basis or ''} ({rule.rule_ref})".strip(),
            confidence=confidence, bbox=bbox, penalty=None,
        )

        if status == "pass":
            result.passed_checks.append(v)
        elif status == "needs_review":
            v.suggested_fix = _suggest_fix(rule, found)
            result.needs_review_checks.append(v)
        else:
            offence_count = offence_history.get(rule.id, 0)
            v.penalty = _penalty_for(rule.penalty_tiers, offence_count)
            v.suggested_fix = _suggest_fix(rule, found)
            total_penalty += v.penalty["fine_max_inr"]
            actual_deduction += weight
            result.violations.append(v)

    result.score = max(0, round(100 - (actual_deduction / max_deduction) * 100)) if max_deduction else 100
    result.total_penalty_exposure_inr = total_penalty

    if result.violations:
        result.verdict = "non_compliant" if any(v.severity == "critical" for v in result.violations) else "partial"
    elif result.needs_review_checks:
        result.verdict = "needs_review"
    else:
        result.verdict = "compliant"

    return result


def compare_over_time(
    product: dict,
    fields: dict,
    dates: list[date],
    rules: list[RuleSchema] | None = None,
    exemptions: list[ExemptionSchema] | None = None,
) -> dict[str, ComplianceResult]:
    rules = rules if rules is not None else load_rules()
    exemptions = exemptions if exemptions is not None else load_exemptions()
    return {
        d.isoformat(): run_compliance_check(product, fields, rules, exemptions, as_on_date=d)
        for d in dates
    }