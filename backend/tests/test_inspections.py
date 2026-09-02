import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import PackWiseException
from app.database.models import (
    ComplianceResult,
    Inspection,
    InspectionStatus,
    OCRResult,
)
from app.main import app

client = TestClient(app)

# Helper function to generate mock file payloads
def create_upload_files(filenames=["test.jpeg"], content=b"fake data", content_type="image/jpeg"):
    return [("files", (name, content, content_type)) for name in filenames]

@pytest.fixture
def mock_storage_service():
    with patch("app.api.routes.inspections.storage_service") as mock_storage:
        mock_storage.save_upload = AsyncMock(return_value="uploads/test-uuid.jpeg")
        mock_storage.delete_file = MagicMock()
        yield mock_storage

@pytest.fixture
def mock_inspection_service():
    with patch("app.api.routes.inspections.create_inspection") as mock_create:
        fake_inspection = Inspection(
            id=uuid.uuid4(),
            status=InspectionStatus.CREATED.value,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_create.return_value = fake_inspection
        yield mock_create

def test_upload_inspection_success_jpeg(mock_storage_service, mock_inspection_service):
    files = create_upload_files(filenames=["test.jpeg"], content_type="image/jpeg")
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 201

def test_upload_inspection_multiple_files(mock_storage_service, mock_inspection_service):
    files = create_upload_files(filenames=["front.jpeg", "back.jpeg"], content_type="image/jpeg")
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 201
    assert mock_storage_service.save_upload.call_count == 2

def test_upload_inspection_reject_unsupported_mime(mock_storage_service, mock_inspection_service):
    files = create_upload_files(filenames=["test.pdf"], content_type="application/pdf")
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 400

def test_upload_inspection_reject_empty_file(mock_storage_service, mock_inspection_service):
    files = create_upload_files(content=b"") # 0 bytes
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 400

def test_upload_inspection_reject_oversized_file(mock_storage_service, mock_inspection_service):
    large_content = b"0" * ((10 * 1024 * 1024) + 1)
    files = create_upload_files(content=large_content)
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 400

def test_upload_inspection_database_failure_cleanup(mock_storage_service, mock_inspection_service):
    mock_inspection_service.side_effect = PackWiseException(
        message="Simulated DB failure",
        code="DATABASE_ERROR",
        status_code=500
    )
    files = create_upload_files()
    response = client.post("/api/v1/inspections", files=files)
    assert response.status_code == 500
    mock_storage_service.delete_file.assert_called_once_with("uploads/test-uuid.jpeg")

# GET API Tests
@patch("app.api.routes.inspections.get_inspection")
def test_get_inspection_success(mock_get_inspection):
    fake_id = uuid.uuid4()
    mock_get_inspection.return_value = Inspection(
        id=fake_id, status=InspectionStatus.COMPLETED.value, created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )
    
    response = client.get(f"/api/v1/inspections/{fake_id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(fake_id)

@patch("app.api.routes.inspections.get_inspection")
def test_get_inspection_not_found(mock_get_inspection):
    fake_id = uuid.uuid4()
    mock_get_inspection.side_effect = PackWiseException(message="Not found", code="INSPECTION_NOT_FOUND", status_code=404)
    
    response = client.get(f"/api/v1/inspections/{fake_id}")
    assert response.status_code == 404

@patch("app.api.routes.inspections.get_ocr_result")
def test_get_inspection_ocr_success(mock_get_ocr):
    fake_id = uuid.uuid4()
    mock_get_ocr.return_value = OCRResult(
        id=uuid.uuid4(), inspection_id=fake_id, full_text="Detected text", processing_status="COMPLETED", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )
    
    response = client.get(f"/api/v1/inspections/{fake_id}/ocr")
    assert response.status_code == 200
    assert response.json()["full_text"] == "Detected text"

@patch("app.api.routes.inspections.get_ocr_result")
def test_get_inspection_ocr_not_ready(mock_get_ocr):
    fake_id = uuid.uuid4()
    mock_get_ocr.side_effect = PackWiseException(message="Not ready", code="OCR_NOT_READY", status_code=404)
    
    response = client.get(f"/api/v1/inspections/{fake_id}/ocr")
    assert response.status_code == 404

@patch("app.api.routes.inspections.get_compliance_result")
def test_get_inspection_compliance_success(mock_get_compliance):
    fake_id = uuid.uuid4()
    mock_get_compliance.return_value = ComplianceResult(
        id=uuid.uuid4(), status="PASS", evaluated_rules=[], passed_rules=[], needs_review=[], exempted=[], evaluated_at=datetime.now(timezone.utc)
    )
    
    response = client.get(f"/api/v1/inspections/{fake_id}/compliance")
    assert response.status_code == 200
    assert response.json()["status"] == "PASS"

@patch("app.api.routes.inspections.get_compliance_result")
def test_get_inspection_compliance_with_violations_and_needs_review(mock_get_compliance):
    fake_id = uuid.uuid4()
    mock_compliance = ComplianceResult(
        id=uuid.uuid4(),
        status="FAIL",
        evaluated_rules=["RULE_1"],
        passed_rules=["RULE_2"],
        needs_review=[
            {
                "rule_id": "RULE_3",
                "rule_name": "Needs Review Rule",
                "severity": "major",
                "message": "Needs manual check"
            }
        ],
        exempted=[],
        evaluated_at=datetime.now(timezone.utc)
    )
    
    from app.database.models import ComplianceViolation
    # Mocking a real violation object that belongs to the relationship
    violation = ComplianceViolation(
        id=uuid.uuid4(),
        rule_id="RULE_1",
        rule_name="Failing Rule",
        severity="critical",
        message="Violated rule"
    )
    mock_compliance.violations = [violation]
    
    mock_get_compliance.return_value = mock_compliance
    
    response = client.get(f"/api/v1/inspections/{fake_id}/compliance")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "FAIL"
    assert len(data["violations"]) == 1
    assert data["violations"][0]["id"] == str(violation.id)
    assert len(data["needs_review"]) == 1
    assert "id" not in data["needs_review"][0] # Verify no ID is required/returned for needs_review
    assert data["needs_review"][0]["rule_id"] == "RULE_3"
