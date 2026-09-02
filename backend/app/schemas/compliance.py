from typing import Any

from pydantic import BaseModel


class ComplianceViolationCreate(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    message: str
    field: str | None = None
    detected_value: str | None = None
    expected_requirement: str | None = None
    evidence: Any | None = None

class ComplianceResultCreate(BaseModel):
    status: str
    score: float | None = None
    as_on_date: str | None = None
    total_penalty_exposure_inr: float | None = None
    evaluated_rules: Any
    passed_rules: Any
    violations: list[ComplianceViolationCreate] = []
    needs_review: list[ComplianceViolationCreate] | None = []
    exempted: list[ComplianceViolationCreate] | None = []
    llm_verification_status: str | None = None
    llm_verification_message: str | None = None
    llm_verification_references: Any | None = None

