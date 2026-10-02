#!/usr/bin/env python3
"""
NexusOps Enterprise - Test Suite for Autonomous Remediation Operator
Verifies decision matrix thresholds, action execution, and safety cooldown logic.
"""

import sys
from pathlib import Path

# Add automation-engine directory to sys.path
ENGINE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ENGINE_DIR))

from remediation_operator import AutonomousRemediationOperator

def test_restart_pod_decision():
    print("Testing RESTART_POD Decision Rule...")
    operator = AutonomousRemediationOperator()
    event = {
        "service_name": "test-service-dotnet",
        "anomaly_score": 0.91,
        "error_rate": 0.07,
        "memory_usage_pct": 60.0,
        "latency_ms": 100.0
    }
    res = operator.evaluate_remediation(event)
    assert res["action"] == "RESTART_POD", f"Expected RESTART_POD but got {res['action']}"
    assert res["executed"] is True
    print("✅ RESTART_POD decision verified!")

def test_resource_tuning_decision():
    print("\nTesting TUNE_RESOURCES Decision Rule...")
    operator = AutonomousRemediationOperator()
    event = {
        "service_name": "test-service-fastapi",
        "anomaly_score": 0.87,
        "error_rate": 0.01,
        "memory_usage_pct": 91.0,
        "latency_ms": 150.0
    }
    res = operator.evaluate_remediation(event)
    assert res["action"] == "TUNE_RESOURCES", f"Expected TUNE_RESOURCES but got {res['action']}"
    assert res["executed"] is True
    print("✅ TUNE_RESOURCES decision verified!")

def test_cooldown_enforcement():
    print("\nTesting Remediation Cooldown Enforcement...")
    operator = AutonomousRemediationOperator()
    event1 = {
        "service_name": "test-service-cooldown",
        "anomaly_score": 0.92,
        "error_rate": 0.08,
        "memory_usage_pct": 70.0,
        "latency_ms": 100.0
    }
    res1 = operator.evaluate_remediation(event1)
    assert res1["action"] == "RESTART_POD"

    # Immediate second event on same service should hit cooldown
    event2 = {
        "service_name": "test-service-cooldown",
        "anomaly_score": 0.95,
        "error_rate": 0.10,
        "memory_usage_pct": 70.0,
        "latency_ms": 100.0
    }
    res2 = operator.evaluate_remediation(event2)
    assert res2["action"] == "COOLDOWN_SKIP", f"Expected COOLDOWN_SKIP but got {res2['action']}"
    assert res2["executed"] is False
    print("✅ Safety Cooldown logic verified!")

def test_no_action_low_score():
    print("\nTesting Low Anomaly Score Threshold...")
    operator = AutonomousRemediationOperator()
    event = {
        "service_name": "healthy-service",
        "anomaly_score": 0.35,
        "error_rate": 0.001,
        "memory_usage_pct": 45.0,
        "latency_ms": 25.0
    }
    res = operator.evaluate_remediation(event)
    assert res["action"] == "NO_ACTION"
    assert res["executed"] is False
    print("✅ NO_ACTION threshold verified!")

def main():
    print("============================================================")
    print("🧪 Running Autonomous Remediation Operator Test Suite")
    print("============================================================")
    test_restart_pod_decision()
    test_resource_tuning_decision()
    test_cooldown_enforcement()
    test_no_action_low_score()
    print("============================================================")
    print("🎉 ALL REMEDIATION OPERATOR TESTS PASSED SUCCESSFULLY!")
    print("============================================================")

if __name__ == "__main__":
    main()
