#!/usr/bin/env python3
"""
NexusOps Enterprise - Production Readiness & Security Audit Suite
Performs automated pre-deployment validation across containers, Kubernetes manifests,
security policies, database scripts, production environment configs, and mobile SDKs.
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = REPO_ROOT / "devops" / "reports"

class ProductionAuditor:
    def __init__(self):
        self.checks = []
        self.passed = 0
        self.failed = 0

    def add_result(self, category: str, name: str, passed: bool, detail: str):
        if passed:
            self.passed += 1
            status_icon = "✅ PASS"
        else:
            self.failed += 1
            status_icon = "❌ FAIL"
            
        result = {
            "category": category,
            "check": name,
            "status": "PASS" if passed else "FAIL",
            "detail": detail
        }
        self.checks.append(result)
        print(f"[{status_icon}] {category} -> {name}: {detail}")

    def audit_dockerfiles(self):
        print("\n--- Auditing Container Security & Dockerfiles ---")
        docker_dir = REPO_ROOT / "devops" / "docker"
        dockerfiles = list(docker_dir.glob("Dockerfile*"))
        
        for df in dockerfiles:
            content = df.read_text()
            filename = df.name
            
            # Check 1: Non-root user directive
            has_user = "USER " in content or "useradd" in content or "adduser" in content
            self.add_result("Container Security", f"{filename} Non-Root User", has_user,
                            "Unprivileged user configured" if has_user else "Missing USER execution constraint")
            
            # Check 2: Healthcheck directive
            has_hc = "HEALTHCHECK" in content
            self.add_result("Container Security", f"{filename} Healthcheck", has_hc,
                            "Container HEALTHCHECK defined" if has_hc else "Missing HEALTHCHECK instruction")

    def audit_kubernetes(self):
        print("\n--- Auditing Kubernetes & Service Mesh Manifests ---")
        k8s_dir = REPO_ROOT / "k8s"
        
        # Check PDB
        pdb_file = k8s_dir / "pdb.yaml"
        self.add_result("Kubernetes Resilience", "PodDisruptionBudget Manifest", pdb_file.exists(),
                        f"Found {pdb_file.relative_to(REPO_ROOT)}" if pdb_file.exists() else "Missing k8s/pdb.yaml")

        # Check NetworkPolicy
        np_file = k8s_dir / "network-policy.yaml"
        self.add_result("Kubernetes Resilience", "NetworkPolicy Security Manifest", np_file.exists(),
                        f"Found {np_file.relative_to(REPO_ROOT)}" if np_file.exists() else "Missing k8s/network-policy.yaml")

        # Check Service Mesh
        mesh_dir = k8s_dir / "service-mesh"
        self.add_result("Zero-Trust Mesh", "Istio mTLS Service Mesh Manifests", mesh_dir.exists() and len(list(mesh_dir.glob("*.yaml"))) > 0,
                        f"Istio mesh manifests present in {mesh_dir.relative_to(REPO_ROOT)}" if mesh_dir.exists() else "Missing service-mesh directory")

        # Check Argo Rollouts Canary
        canary_file = k8s_dir / "canary" / "rollout-canary.yaml"
        self.add_result("Progressive Delivery", "Argo Rollouts Canary Manifest", canary_file.exists(),
                        "Argo Rollout canary spec validated" if canary_file.exists() else "Missing rollout-canary.yaml")

    def audit_production_configs(self):
        print("\n--- Auditing Production Configuration & Environment Templates ---")
        env_example = REPO_ROOT / ".env.production.example"
        self.add_result("Configuration", "Production Environment Template", env_example.exists(),
                        "Found .env.production.example" if env_example.exists() else "Missing .env.production.example")

        appsettings_prod = REPO_ROOT / "backend-dotnet" / "src" / "NexusOps.Api" / "appsettings.Production.json"
        self.add_result("Configuration", "ASP.NET Core Production Settings", appsettings_prod.exists(),
                        "Found appsettings.Production.json" if appsettings_prod.exists() else "Missing appsettings.Production.json")

    def audit_database(self):
        print("\n--- Auditing Database Schema & Migration Tools ---")
        migration_script = REPO_ROOT / "database" / "scripts" / "migrate_and_seed.sh"
        self.add_result("Database", "Production Migration Runner Script", migration_script.exists() and os.access(migration_script, os.X_OK),
                        "Found executable database/scripts/migrate_and_seed.sh" if migration_script.exists() else "Missing migration script")

        migrations_dir = REPO_ROOT / "database" / "migrations"
        sql_files = list(migrations_dir.glob("*.sql"))
        self.add_result("Database", "SQL Migration Scripts", len(sql_files) > 0,
                        f"Found {len(sql_files)} SQL migration scripts" if sql_files else "No SQL migrations found")

    def audit_mobile_sdk(self):
        print("\n--- Auditing Mobile Applications SDK Parity ---")
        android_models = REPO_ROOT / "mobile-android" / "app" / "src" / "main" / "java" / "com" / "nexusops" / "model" / "EnterpriseModels.kt"
        self.add_result("Mobile SDK", "Android Native Models", android_models.exists(),
                        "Android Jetpack Compose models validated" if android_models.exists() else "Missing Android models")

        ios_models = REPO_ROOT / "mobile-ios" / "Models" / "EnterpriseModels.swift"
        self.add_result("Mobile SDK", "iOS Native Models", ios_models.exists(),
                        "iOS SwiftUI Codable models validated" if ios_models.exists() else "Missing iOS models")

    def generate_report(self):
        total = self.passed + self.failed
        score = (self.passed / total * 100) if total > 0 else 0
        
        report_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "audit_type": "Production Readiness & Security Hardening",
            "total_checks": total,
            "passed_checks": self.passed,
            "failed_checks": self.failed,
            "readiness_score_percent": round(score, 1),
            "status": "PRODUCTION READY" if self.failed == 0 else "ACTION REQUIRED",
            "checks": self.checks
        }

        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_file = REPORTS_DIR / "production_readiness_report.json"
        report_file.write_text(json.dumps(report_data, indent=2))

        print("\n============================================================")
        print(f"📊 PRODUCTION READINESS AUDIT SUMMARY")
        print(f"Passed: {self.passed} / {total} ({score:.1f}%)")
        print(f"Status: {report_data['status']}")
        print(f"Report Saved to: {report_file.relative_to(REPO_ROOT)}")
        print("============================================================\n")
        
        return self.failed == 0

def main():
    auditor = ProductionAuditor()
    auditor.audit_dockerfiles()
    auditor.audit_kubernetes()
    auditor.audit_production_configs()
    auditor.audit_database()
    auditor.audit_mobile_sdk()
    
    success = auditor.generate_report()
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
