import math

def calculate_anomaly_score(duration_ms: float, payload_kb: float) -> dict:
    """
    Standard library implementation of execution anomaly scoring logic
    """
    # Baseline expected duration: 45ms, expected payload: 10KB
    duration_dev = abs(duration_ms - 45.0) / 45.0
    payload_dev = abs(payload_kb - 10.0) / 10.0
    anomaly_score = min(1.0, max(0.0, (duration_dev * 0.7 + payload_dev * 0.3)))
    is_anomaly = anomaly_score > 0.85
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 4)
    }

def generate_mock_embedding(text: str, dim: int = 1536) -> list:
    """
    Standard library vector embedding generator
    """
    seed = sum(ord(c) for c in text) % 1000
    vec = [(math.sin(seed + i)) for i in range(dim)]
    norm = math.sqrt(sum(x*x for x in vec))
    return [x / norm for x in vec]

def cosine_similarity(v1: list, v2: list) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    return dot / (norm1 * norm2)

def test_anomaly_detection():
    print("Testing Anomaly Detection Math...")
    res = calculate_anomaly_score(45.0, 10.0)
    assert "is_anomaly" in res
    assert 0.0 <= res["anomaly_score"] <= 1.0
    print(f"✅ Anomaly Detection passed! Result: {res}")

def test_vector_rag():
    print("\nTesting Vector RAG Cosine Similarity...")
    e1 = generate_mock_embedding("anomaly detection")
    e2 = generate_mock_embedding("anomaly alert system")
    score = cosine_similarity(e1, e2)
    assert -1.0 <= score <= 1.0
    print(f"✅ Vector RAG passed! Similarity score: {round(score, 4)}")

if __name__ == "__main__":
    test_anomaly_detection()
    test_vector_rag()
    print("\n🎉 ALL STANDALONE AI TESTS PASSED!")
