import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


def utc_now():
    return datetime.now(timezone.utc)

class InspectionStatus(str, Enum):
    CREATED = "CREATED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String, nullable=False, default=InspectionStatus.CREATED.value)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    images = relationship("Image", back_populates="inspection", cascade="all, delete-orphan")
    ocr_result = relationship("OCRResult", back_populates="inspection", uselist=False, cascade="all, delete-orphan")
    extracted_product = relationship("ExtractedProduct", back_populates="inspection", uselist=False, cascade="all, delete-orphan")
    compliance_result = relationship("ComplianceResult", back_populates="inspection", uselist=False, cascade="all, delete-orphan")

class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    
    storage_path = Column(String, nullable=False)
    side = Column(String, nullable=True) # e.g. front, back, top
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="images")
    ocr_results = relationship("OCRResult", back_populates="image", cascade="all, delete-orphan")

class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    image_id = Column(UUID(as_uuid=True), ForeignKey("images.id", ondelete="CASCADE"), nullable=True, index=True)
    
    full_text = Column(Text, nullable=True)
    regions = Column(JSONB, nullable=True) # Bounding boxes from CV
    processing_status = Column(String, nullable=False, default="COMPLETED")
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="ocr_result")
    image = relationship("Image", back_populates="ocr_results")

class ExtractedProduct(Base):
    __tablename__ = "extracted_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    data = Column(JSONB, nullable=False) # Pydantic model serialized output
    original_nlp_data = Column(JSONB, nullable=True) # Unrefined NLP payload for fallback/provenance
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="extracted_product")

class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    status = Column(String, nullable=False)
    score = Column(Float, nullable=True)
    as_on_date = Column(String, nullable=True)
    total_penalty_exposure_inr = Column(Float, nullable=True)
    
    evaluated_rules = Column(JSONB, nullable=False)
    passed_rules = Column(JSONB, nullable=False)
    needs_review = Column(JSONB, nullable=True)
    exempted = Column(JSONB, nullable=True)
    
    llm_verification_status = Column(String, nullable=True) # e.g. AGREE, DISAGREE, UNVERIFIED
    llm_verification_message = Column(Text, nullable=True)
    llm_verification_references = Column(JSONB, nullable=True)
    
    evaluated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="compliance_result")
    violations = relationship("ComplianceViolation", back_populates="compliance_result", cascade="all, delete-orphan")

class ComplianceViolation(Base):
    __tablename__ = "compliance_violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    compliance_result_id = Column(UUID(as_uuid=True), ForeignKey("compliance_results.id", ondelete="CASCADE"), nullable=False, index=True)
    
    rule_id = Column(String, nullable=False)
    rule_name = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    field = Column(String, nullable=True)
    detected_value = Column(String, nullable=True)
    expected_requirement = Column(String, nullable=True)
    evidence = Column(JSONB, nullable=True) # E.g., bounding boxes for the violation

    # Relationships
    compliance_result = relationship("ComplianceResult", back_populates="violations")
