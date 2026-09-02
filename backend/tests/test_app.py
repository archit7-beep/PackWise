from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_openapi_docs():
    response = client.get("/docs")
    assert response.status_code == 200

def test_request_id_middleware():
    # Test without providing a request ID (should generate one)
    response = client.get("/api/v1/health")
    assert "x-request-id" in response.headers
    assert response.headers["x-request-id"] != ""

    # Test providing a custom request ID
    custom_id = "test-custom-uuid-1234"
    response = client.get("/api/v1/health", headers={"X-Request-ID": custom_id})
    assert response.headers["x-request-id"] == custom_id

def test_404_not_found():
    response = client.get("/non-existent-route")
    assert response.status_code == 404
