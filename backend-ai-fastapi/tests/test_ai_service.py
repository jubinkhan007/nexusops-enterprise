from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_model_loaded"] is True

def test_anomaly_detection():
    payload = {
        "execution_duration_ms": 45.0,
        "payload_size_kb": 10.0
    }
    response = client.post("/api/v1/anomaly/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "is_anomaly" in data
    assert "anomaly_score" in data

def test_rag_semantic_search():
    payload = {
        "query": "system anomaly alerts"
    }
    response = client.post("/api/v1/rag/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ai_synthesis" in data
    assert len(data["top_matches"]) > 0

