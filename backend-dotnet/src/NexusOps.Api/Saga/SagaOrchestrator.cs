using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace NexusOps.Api.Saga
{
    public class SagaOrchestrator
    {
        private static readonly ConcurrentDictionary<string, SagaExecutionState> History = new();

        public SagaExecutionState ExecuteSaga(string workflowName, bool simulateFailure = false)
        {
            var sagaId = $"saga-{Guid.NewGuid().ToString("N").Substring(0, 8)}";
            var now = DateTime.UtcNow.ToString("o");

            var state = new SagaExecutionState
            {
                SagaId = sagaId,
                WorkflowName = workflowName,
                Status = "InProgress",
                StartedAt = now,
                KafkaTopic = "nexusops-saga-events",
                Steps = new List<SagaStep>()
            };

            // Step 1: Workflow Initiation
            state.Steps.Add(new SagaStep { StepName = "WorkflowInitiated", Status = "Completed", Timestamp = DateTime.UtcNow.ToString("o") });

            // Step 2: Vector Document Ingestion
            state.Steps.Add(new SagaStep { StepName = "VectorIngestionCompleted", Status = "Completed", Timestamp = DateTime.UtcNow.ToString("o") });

            // Step 3: Anomaly Scan / Failure Check
            if (simulateFailure)
            {
                state.Steps.Add(new SagaStep { StepName = "AnomalyScanFailed", Status = "FAILED", ErrorMessage = "Simulated ML Model Timeout / Invalid Vector Payload", Timestamp = DateTime.UtcNow.ToString("o") });
                state.Status = "Compensating";

                // Execute Compensation Rollbacks
                state.Steps.Add(new SagaStep { StepName = "Compensation: PurgeUncommittedVectors", Status = "COMPENSATED", Timestamp = DateTime.UtcNow.ToString("o") });
                state.Steps.Add(new SagaStep { StepName = "Compensation: RevertWorkflowState", Status = "COMPENSATED", Timestamp = DateTime.UtcNow.ToString("o") });
                
                state.Status = "RolledBack";
                state.CompletedAt = DateTime.UtcNow.ToString("o");
                History[sagaId] = state;
                return state;
            }

            state.Steps.Add(new SagaStep { StepName = "AnomalyScanCompleted", Status = "Completed", Timestamp = DateTime.UtcNow.ToString("o") });

            // Step 4: Audit Ledger Commit
            state.Steps.Add(new SagaStep { StepName = "AuditLedgerCommitted", Status = "Completed", Timestamp = DateTime.UtcNow.ToString("o") });

            // Step 5: Saga Completion
            state.Status = "Completed";
            state.CompletedAt = DateTime.UtcNow.ToString("o");

            History[sagaId] = state;
            return state;
        }

        public IEnumerable<SagaExecutionState> GetSagaHistory()
        {
            if (History.IsEmpty)
            {
                // Return initial sample history
                ExecuteSaga("Gemini Vector Batch Ingestion", false);
                ExecuteSaga("IsolationForest Anomaly Audit", true);
            }
            return History.Values;
        }
    }

    public class SagaExecutionState
    {
        public string SagaId { get; set; } = string.Empty;
        public string WorkflowName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StartedAt { get; set; } = string.Empty;
        public string? CompletedAt { get; set; }
        public string KafkaTopic { get; set; } = string.Empty;
        public List<SagaStep> Steps { get; set; } = new();
    }

    public class SagaStep
    {
        public string StepName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Completed | FAILED | COMPENSATED
        public string? ErrorMessage { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }
}
