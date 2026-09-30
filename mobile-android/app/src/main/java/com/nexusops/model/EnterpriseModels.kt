package com.nexusops.model

data class MultiRegionSummary(
    val topology: String = "Active-Active Latency-Based",
    val primary_region: String = "us-east-1",
    val secondary_region: String = "eu-west-1",
    val route53_health: String = "HEALTHY",
    val replication_lag_ms: Double = 18.5,
    val rpo_seconds: Double = 0.02,
    val rto_seconds: Double = 1.42,
    val status: String = "OPERATIONAL"
)

data class FinOpsSummaryMobile(
    val current_monthly_spend_usd: Double = 14250.0,
    val optimized_monthly_spend_usd: Double = 9100.0,
    val potential_savings_usd: Double = 5150.0,
    val potential_savings_percentage: Double = 36.1,
    val unattached_volumes_found: Int = 4,
    val unattached_volume_cost_usd: Double = 480.0
)

data class CanaryStatusMobile(
    val rollout_name: String = "nexusops-backend-canary",
    val canary_version: String = "v2.4.0-canary",
    val stable_version: String = "v2.3.9-stable",
    val canary_percentage: Int = 25,
    val stable_percentage: Int = 75,
    val prometheus_analysis: String = "PASSED",
    val phase: String = "Progressing"
)

data class IncidentItemMobile(
    val incident_id: String = "INC-94821",
    val title: String = "PostgreSQL Replica Node Latency Spike",
    val severity: String = "P1-CRITICAL",
    val service: String = "database-cluster-us-east-1",
    val status: String = "TRIGGERED",
    val on_call_engineer: String = "Alex Mercer (SRE Primary)",
    val mttr_minutes: Double = 8.5
)

data class ComplianceAuditMobile(
    val overall_score_percentage: Double = 98.5,
    val audit_status: String = "AUDIT READY (SOC 2 & ISO 27001)",
    val frameworks_count: Int = 4,
    val controls_verified_count: Int = 5,
    val secret_leaks_found: Int = 0
)

data class EnterpriseOpsSummary(
    val multiRegion: MultiRegionSummary = MultiRegionSummary(),
    val finOps: FinOpsSummaryMobile = FinOpsSummaryMobile(),
    val canary: CanaryStatusMobile = CanaryStatusMobile(),
    val activeIncident: IncidentItemMobile = IncidentItemMobile(),
    val compliance: ComplianceAuditMobile = ComplianceAuditMobile()
)
