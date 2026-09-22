import Foundation

struct WorkflowItem: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let triggerEvent: String
    let actionType: String
    let status: String
    let totalExecutions: Int
}

struct SystemAnalytics: Codable {
    let activeWorkflowsCount: Int
    let totalExecutionsCount: Int
    let anomalyCount: Int
    let averageExecutionTimeMs: Double
    let systemHealthScore: Double
}
