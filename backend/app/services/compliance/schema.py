"""
Internal rule schema for rules/*.yaml.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator

KNOWN_VALIDATION_TYPES = {
    "field_present_non_empty",
    "field_present_numeric_positive",
    "field_present_date",
    "net_quantity_standard_unit",
    "language_or_check",
    "ecommerce_declarations_present",
}


class Severity(str, Enum):
    critical = "critical"
    major = "major"
    minor = "minor"


class RuleCategory(str, Enum):
    mandatory_declaration = "mandatory_declaration"
    net_quantity = "net_quantity"
    presentation = "presentation"
    ecommerce = "ecommerce"


class PenaltyTiers(BaseModel):
    first_offence_min: int = 0
    first_offence_max: int = 25_000
    second_offence_min: int = 0
    second_offence_max: int = 50_000
    subsequent_offence_min: int = 50_000
    subsequent_offence_max: int = 100_000
    subsequent_imprisonment_months_max: Optional[int] = 12
    basis: str = "Section 36(1), LM Act 2009"


class RuleTestCase(BaseModel):
    name: str
    fields: dict[str, Any]
    expect_status: str


class RuleSchema(BaseModel):
    id: str
    rule_ref: str
    title: str
    category: RuleCategory
    description: str
    default_severity: Severity
    applies_to_categories: list[str] = Field(default_factory=lambda: ["all"])
    exemption_refs: list[str] = Field(default_factory=list)
    effective_from: date
    effective_until: Optional[date] = None
    validation_type: str
    field: Optional[str] = None
    condition: Optional[str] = None
    params: dict[str, Any] = Field(default_factory=dict)
    required_fields: list[str] = Field(default_factory=list)
    excluded_fields: list[str] = Field(default_factory=list)
    confidence_threshold: float = 0.6
    penalty_tiers: PenaltyTiers = Field(default_factory=PenaltyTiers)
    fix_example: Optional[str] = None
    act_basis: Optional[str] = None
    amendment_ref: Optional[str] = None
    notes: Optional[str] = None
    test_cases: list[RuleTestCase] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_validation_type_known(self) -> "RuleSchema":
        if self.validation_type not in KNOWN_VALIDATION_TYPES:
            raise ValueError(
                f"Rule {self.id} references unknown validation_type "
                f"'{self.validation_type}'. Add a handler in validator.py "
                f"VALIDATORS or fix the YAML."
            )
        return self


class ExemptionCondition(BaseModel):
    key: str
    description: str
    exclude_categories: list[str] = Field(default_factory=list)
    amendment_ref: Optional[str] = None
    effective_from: Optional[date] = None
    override_threshold_kg: dict[str, float] = Field(default_factory=dict)


class ExemptionSchema(BaseModel):
    id: str
    rule_ref: str
    title: str
    description: str
    conditions: list[ExemptionCondition]