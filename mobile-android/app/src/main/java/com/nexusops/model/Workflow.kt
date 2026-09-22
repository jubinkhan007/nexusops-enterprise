package com.nexusops.model

data class WorkflowItem(
    val id: String,
    val name: String,
    val description: String,
    val triggerEvent: String,
    val actionType: String,
    val status: String,
    val totalExecutions: Int
)

data class SystemAnalytics(
    val activeWorkflowsCount: Int,
    val totalExecutionsCount: Int,
    val anomalyCount: Int,
    val averageExecutionTimeMs: Double,
    val systemHealthScore: Double
)
