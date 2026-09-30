import Foundation

struct MultiRegionSummaryIOS: Codable {
    var topology: String = "Active-Active Latency-Based"
    var primaryRegion: String = "us-east-1"
    var secondaryRegion: String = "eu-west-1"
    var route53Health: String = "HEALTHY"
    var replicationLagMs: Double = 18.5
    var rpoSeconds: Double = 0.02
    var rtoSeconds: Double = 1.42
    var status: String = "OPERATIONAL"
}

struct FinOpsSummaryIOS: Codable {
    var currentMonthlySpendUsd: Double = 14250.0
    var optimizedMonthlySpendUsd: Double = 9100.0
    var potentialSavingsUsd: Double = 5150.0
    var potentialSavingsPercentage: Double = 36.1
    var unattachedVolumesFound: Int = 4
    var unattachedVolumeCostUsd: Double = 480.0
}

struct CanaryStatusIOS: Codable {
    var rolloutName: String = "nexusops-backend-canary"
    var canaryVersion: String = "v2.4.0-canary"
    var stableVersion: String = "v2.3.9-stable"
    var canaryPercentage: Int = 25
    var stablePercentage: Int = 75
    var prometheusAnalysis: String = "PASSED"
    var phase: String = "Progressing"
}

struct IncidentItemIOS: Codable, Identifiable {
    var id: String { incidentId }
    var incidentId: String = "INC-94821"
    var title: String = "PostgreSQL Replica Node Latency Spike"
    var severity: String = "P1-CRITICAL"
    var service: String = "database-cluster-us-east-1"
    var status: String = "TRIGGERED"
    var onCallEngineer: String = "Alex Mercer (SRE Primary)"
    var mttrMinutes: Double = 8.5
}

struct ComplianceAuditIOS: Codable {
    var overallScorePercentage: Double = 98.5
    var auditStatus: String = "AUDIT READY (SOC 2 & ISO 27001)"
    var frameworksCount: Int = 4
    var controlsVerifiedCount: Int = 5
    var secretLeaksFound: Int = 0
}

struct EnterpriseOpsSummaryIOS: Codable {
    var multiRegion: MultiRegionSummaryIOS = MultiRegionSummaryIOS()
    var finOps: FinOpsSummaryIOS = FinOpsSummaryIOS()
    var canary: CanaryStatusIOS = CanaryStatusIOS()
    var activeIncident: IncidentItemIOS = IncidentItemIOS()
    var compliance: ComplianceAuditIOS = ComplianceAuditIOS()
}
