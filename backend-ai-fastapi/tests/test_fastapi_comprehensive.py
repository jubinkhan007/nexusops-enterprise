import pytest
import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_model_loaded"] is True
    assert data["gemini_rag_active"] is True

def test_prometheus_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    text = response.text
    assert "nexus_workflow_executions_total" in text
    assert "nexus_ml_anomalies_detected_total" in text
    assert "nexus_vector_rag_queries_total" in text
    assert "nexus_system_health_score" in text

def test_isolation_forest_normal_execution():
    payload = {
        "execution_duration_ms": 42.0,
        "payload_size_kb": 10.0
    }
    response = client.post("/api/v1/anomaly/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "is_anomaly" in data
    assert "anomaly_score" in data
    assert data["is_anomaly"] is False
    assert data["anomaly_score"] < 0.70

def test_isolation_forest_anomaly_spike():
    payload = {
        "execution_duration_ms": 480.0,
        "payload_size_kb": 150.0
    }
    response = client.post("/api/v1/anomaly/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "is_anomaly" in data
    assert "anomaly_score" in data
    assert data["is_anomaly"] is True or data["anomaly_score"] > 0.60
    assert "webhook_dispatched" in data


def test_multimodal_file_upload_json():
    json_bytes = b'{"event": "TelemetryReceived", "latency": 45.2, "vector_dim": 1536}'
    files = {"file": ("test_telemetry.json", io.BytesIO(json_bytes), "application/json")}
    
    response = client.post("/api/v1/rag/upload-file", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_telemetry.json"
    assert data["category"] == "JSON Payload"
    assert data["vector_dimension"] == 1536
    assert "Indexed in pgvector store" in data["status"]

def test_multimodal_file_upload_pdf():
    pdf_bytes = b'%PDF-1.4 ... Simulated Anomaly Runbook Document Content ...'
    files = {"file": ("Anomaly_Runbook.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    
    response = client.post("/api/v1/rag/upload-file", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "Anomaly_Runbook.pdf"
    assert data["category"] == "PDF Document"
    assert data["vector_dimension"] == 1536

def test_gemini_rag_ask_query():
    payload = {"query": "What is the SignalR reconnect timing?"}
    response = client.post("/api/v1/rag/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ai_synthesis" in data
    assert data["vector_dimension"] == 1536
    assert len(data["top_matches"]) > 0
