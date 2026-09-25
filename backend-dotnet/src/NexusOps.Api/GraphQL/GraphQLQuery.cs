using System;
using System.Collections.Generic;

namespace NexusOps.Api.GraphQL
{
    public class GraphQLQuery
    {
        public List<GraphQLWorkflow> Workflows => new()
        {
            new GraphQLWorkflow { Id = "wf-001", Name = "Gemini RAG Vector Ingestion", Status = "Completed", ExecutionDurationMs = 450, TriggeredBy = "System Schedule" },
            new GraphQLWorkflow { Id = "wf-002", Name = "IsolationForest Anomaly Scan", Status = "Running", ExecutionDurationMs = 120, TriggeredBy = "Operator (admin)" },
            new GraphQLWorkflow { Id = "wf-003", Name = "Kubernetes Pod Autoscaling Audit", Status = "Completed", ExecutionDurationMs = 890, TriggeredBy = "Webhook Dispatcher" }
        };

        public GraphQLSystemHealth SystemHealth => new()
        {
            HealthScore = "99.8%",
            P95LatencyMs = 18.5,
            ActiveServicesCount = 5,
            PostgresRlsStatus = "Enforced (Row-Level Security Active)",
            WafSecurityStatus = "Active (0 Malicious Payloads Blocked)"
        };

        public List<GraphQLAuditLog> AuditLogs => new()
        {
            new GraphQLAuditLog { LogId = "aud-101", Action = "ROLE_CHANGED", PerformedBy = "admin@nexusops.io", TenantId = "tenant-nexus-global", Timestamp = DateTime.UtcNow.AddMinutes(-12).ToString("o") },
            new GraphQLAuditLog { LogId = "aud-102", Action = "VECTOR_INGEST", PerformedBy = "system", TenantId = "tenant-acme-corp", Timestamp = DateTime.UtcNow.AddMinutes(-5).ToString("o") }
        };

        public GraphQLAiInsights AiInsights => new()
        {
            ModelName = "Scikit-Learn IsolationForest (contamination=0.05)",
            VectorDatabase = "PostgreSQL 16 + pgvector (HNSW Index)",
            TotalRagQueries = 142,
            IndexedVectorCount = 5
        };
    }

    public class GraphQLWorkflow
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ExecutionDurationMs { get; set; }
        public string TriggeredBy { get; set; } = string.Empty;
    }

    public class GraphQLSystemHealth
    {
        public string HealthScore { get; set; } = string.Empty;
        public double P95LatencyMs { get; set; }
        public int ActiveServicesCount { get; set; }
        public string PostgresRlsStatus { get; set; } = string.Empty;
        public string WafSecurityStatus { get; set; } = string.Empty;
    }

    public class GraphQLAuditLog
    {
        public string LogId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }

    public class GraphQLAiInsights
    {
        public string ModelName { get; set; } = string.Empty;
        public string VectorDatabase { get; set; } = string.Empty;
        public int TotalRagQueries { get; set; }
        public int IndexedVectorCount { get; set; }
    }
}
