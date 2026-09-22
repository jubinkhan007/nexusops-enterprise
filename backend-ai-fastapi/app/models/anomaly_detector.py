import numpy as np
from sklearn.ensemble import IsolationForest

class ExecutionAnomalyDetector:
    def __init__(self):
        # Train a lightweight IsolationForest model on execution duration & memory usage features
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        
        # Synthetic baseline data (duration in ms, payload size in KB)
        normal_data = np.random.normal(loc=[45.0, 10.0], scale=[10.0, 2.0], size=(500, 2))
        self.model.fit(normal_data)

    def predict_anomaly(self, duration_ms: float, payload_kb: float) -> dict:
        """
        Computes anomaly decision and continuous anomaly score (-1.0 to 1.0)
        """
        features = np.array([[duration_ms, payload_kb]])
        prediction = self.model.predict(features)[0] # -1 for anomaly, 1 for normal
        decision_score = self.model.decision_function(features)[0]
        
        # Convert decision function score to 0.0 - 1.0 probability range
        anomaly_score = max(0.0, min(1.0, 1.0 - (decision_score + 0.5)))

        return {
            "is_anomaly": bool(prediction == -1),
            "anomaly_score": round(float(anomaly_score), 4),
            "decision_function": round(float(decision_score), 4)
        }

anomaly_detector = ExecutionAnomalyDetector()
