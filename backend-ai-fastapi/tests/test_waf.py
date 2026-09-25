import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_waf_blocks_sqli_query():
    response = client.get("/api/v1/health?query=UNION SELECT * FROM users")
    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "Forbidden"
    assert "WAF" in data["message"]

def test_waf_blocks_xss_header():
    response = client.get("/api/v1/health", headers={"User-Agent": "<script>alert(1)</script>"})
    assert response.status_code == 403
    data = response.json()
    assert data["error"] == "Forbidden"

def test_waf_allows_clean_request():
    response = client.get("/api/v1/health?search=operations")
    assert response.status_code == 200
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers
