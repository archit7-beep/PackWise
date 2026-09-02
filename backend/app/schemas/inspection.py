from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

# Import Enum to match database exactly without coupling to SQLAlchemy models
from app.database.models import InspectionStatus


class ImageResponse(BaseModel):
    id: UUID
    storage_path: str
    side: str | None = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OCRResultResponse(BaseModel):
    id: UUID
    image_id: UUID | None = None
    full_text: str | None = None
    regions: Any | None = None
    processing_status: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ComplianceRuleItemResponse(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    message: str
    field: str | None = None
    detected_value: str | None = None
    expected_requirement: str | None = None
    evidence: Any | None = None
    
    model_config = ConfigDict(from_attributes=True)

class ComplianceViolationResponse(ComplianceRuleItemResponse):
    id: UUID

class ComplianceResultResponse(BaseModel):
    id: UUID
    status: str
    score: float | None = None
    as_on_date: str | None = None
    total_penalty_exposure_inr: float | None = None
    evaluated_rules: Any
    passed_rules: Any
    violations: list[ComplianceViolationResponse] = []
    needs_review: list[ComplianceRuleItemResponse] | None = []
    exempted: list[ComplianceRuleItemResponse] | None = []
    
    llm_verification_status: str | None = None
    llm_verification_message: str | None = None
    llm_verification_references: Any | None = None
    
    evaluated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InspectionResponse(BaseModel):
    id: UUID
    status: InspectionStatus
    created_at: datetime
    updated_at: datetime
    
    # We optionally include related models for the GET endpoint
    images: list[ImageResponse] = []
    product_data: Any | None = None
    
    model_config = ConfigDict(from_attributes=True)
