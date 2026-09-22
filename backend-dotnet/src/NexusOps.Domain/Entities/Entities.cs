using System;
using System.Collections.Generic;

namespace NexusOps.Domain.Entities
{
    public enum WorkflowStatus
    {
        Draft,
        Active,
        Paused,
        Completed,
        Failed
    }

    public enum ExecutionState
    {
        Pending,
        Running,
        Success,
        Failed,
        AnomalyDetected
    }

    public class Tenant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<User> Users { get; set; } = new();
        public List<AutomationWorkflow> Workflows { get; set; } = new();
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Operator";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AutomationWorkflow
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TriggerEvent { get; set; } = string.Empty;
        public string ConditionJson { get; set; } = "{}";
        public string ActionType { get; set; } = string.Empty;
        public WorkflowStatus Status { get; set; } = WorkflowStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<ExecutionLog> ExecutionLogs { get; set; } = new();
    }

    public class DocumentPayload
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ContentType { get; set; } = "text/plain";
        public string Category { get; set; } = "General";
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public List<AIInsight> AIInsights { get; set; } = new();
    }

    public class ExecutionLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid WorkflowId { get; set; }
        public AutomationWorkflow? Workflow { get; set; }
        public ExecutionState State { get; set; }
        public double ExecutionDurationMs { get; set; }
        public string LogOutput { get; set; } = string.Empty;
        public double AnomalyScore { get; set; }
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    }

    public class AIInsight
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? DocumentId { get; set; }
        public DocumentPayload? Document { get; set; }
        public string InsightType { get; set; } = "SemanticRAG";
        public string Summary { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public string VectorEmbeddingReference { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
