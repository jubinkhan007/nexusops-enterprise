using System;
using System.Collections.Generic;

namespace NexusOps.Application.DTOs
{
    public record CreateWorkflowDto(
        Guid TenantId,
        string Name,
        string Description,
        string TriggerEvent,
        string ConditionJson,
        string ActionType
    );

    public record WorkflowResponseDto(
        Guid Id,
        Guid TenantId,
        string Name,
        string Description,
        string TriggerEvent,
        string ConditionJson,
        string ActionType,
        string Status,
        DateTime CreatedAt,
        int TotalExecutions
    );

    public record TriggerWorkflowDto(
        Guid WorkflowId,
        string TriggerSource,
        string PayloadJson
    );

    public record ExecutionResultDto(
        Guid ExecutionId,
        Guid WorkflowId,
        string State,
        double ExecutionDurationMs,
        double AnomalyScore,
        string LogOutput,
        DateTime ExecutedAt
    );

    public record AIInsightDto(
        Guid Id,
        Guid? DocumentId,
        string InsightType,
        string Summary,
        double ConfidenceScore,
        DateTime GeneratedAt
    );

    public record SystemAnalyticsSummaryDto(
        int ActiveWorkflowsCount,
        int TotalExecutionsCount,
        int AnomalyCount,
        double AverageExecutionTimeMs,
        int DocumentsProcessed,
        double SystemHealthScore
    );
}
