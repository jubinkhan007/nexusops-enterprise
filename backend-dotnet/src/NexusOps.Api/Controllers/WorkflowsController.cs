using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NexusOps.Application.DTOs;
using NexusOps.Domain.Entities;
using NexusOps.Infrastructure.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NexusOps.Api.Controllers
{
    public record SimulationRequestDto(
        string WorkflowName,
        double ExecutionDurationMs,
        double PayloadSizeKb
    );

    public record CreateWorkflowRequestDto(
        string Name,
        string Description,
        string TriggerEvent,
        string ConditionJson,
        string ActionType
    );

    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowsController : ControllerBase
    {
        private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
        private static readonly List<WorkflowResponseDto> _workflowsStore = new()
        {
            new(
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Guid.NewGuid(),
                "Document Sentiment & Classification Pipeline",
                "Triggers AI microservice upon document upload to compute embeddings & sentiment",
                "DocumentUploaded",
                "{\"fileType\": \"pdf\", \"sizeLt\": 10485760}",
                "RunFastApiInference",
                "Active",
                DateTime.UtcNow.AddDays(-5),
                142
            ),
            new(
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Guid.NewGuid(),
                "Anomaly Detection Alerting Workflow",
                "Evaluates execution telemetry against ML model to flag system anomalies",
                "TelemetryReceived",
                "{\"anomalyScoreGt\": 0.85}",
                "DispatchSignalRAlert",
                "Active",
                DateTime.UtcNow.AddDays(-2),
                89
            ),
            new(
                Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Guid.NewGuid(),
                "PostgreSQL pgvector Embedding Sync",
                "Synchronizes 1536-dim vector embeddings with pgvector HNSW index",
                "VectorSyncRequested",
                "{\"dimension\": 1536}",
                "ReindexHnswVectorStore",
                "Active",
                DateTime.UtcNow.AddDays(-1),
                64
            )
        };

        public WorkflowsController(IHubContext<NotificationHub, INotificationClient> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkflowResponseDto>> GetWorkflows()
        {
            return Ok(_workflowsStore);
        }

        [HttpPost]
        public async Task<ActionResult<WorkflowResponseDto>> CreateWorkflow([FromBody] CreateWorkflowRequestDto dto)
        {
            var newWorkflow = new WorkflowResponseDto(
                Guid.NewGuid(),
                Guid.NewGuid(),
                dto.Name,
                dto.Description,
                dto.TriggerEvent,
                dto.ConditionJson,
                dto.ActionType,
                "Active",
                DateTime.UtcNow,
                0
            );

            _workflowsStore.Insert(0, newWorkflow);

            await _hubContext.Clients.All.ReceiveSystemAlert(
                "info",
                $"New automation workflow created: '{dto.Name}' (Trigger: {dto.TriggerEvent})."
            );

            return CreatedAtAction(nameof(GetWorkflows), new { id = newWorkflow.Id }, newWorkflow);
        }

        [HttpPut("{id:guid}/status")]
        public async Task<ActionResult<WorkflowResponseDto>> ToggleStatus(Guid id, [FromQuery] string status)
        {
            var index = _workflowsStore.FindIndex(w => w.Id == id);
            if (index == -1) return NotFound();

            var existing = _workflowsStore[index];
            var updated = existing with { Status = status };
            _workflowsStore[index] = updated;

            await _hubContext.Clients.All.ReceiveSystemAlert(
                "warning",
                $"Workflow '{existing.Name}' status updated to '{status}'."
            );

            return Ok(updated);
        }

        [HttpPost("trigger-simulation")]
        public async Task<ActionResult<ExecutionResultDto>> TriggerSimulation([FromBody] SimulationRequestDto dto)
        {
            var durationDev = Math.Abs(dto.ExecutionDurationMs - 45.0) / 45.0;
            var payloadDev = Math.Abs(dto.PayloadSizeKb - 10.0) / 10.0;
            var anomalyScore = Math.Min(1.0, Math.Max(0.0, durationDev * 0.7 + payloadDev * 0.3));
            var state = anomalyScore > 0.8 ? "AnomalyDetected" : "Success";

            var result = new ExecutionResultDto(
                Guid.NewGuid(),
                Guid.NewGuid(),
                state,
                dto.ExecutionDurationMs,
                Math.Round(anomalyScore, 4),
                $"Executed workflow '{dto.WorkflowName}' with duration {dto.ExecutionDurationMs}ms and payload {dto.PayloadSizeKb}KB.",
                DateTime.UtcNow
            );

            // Broadcast real-time event across SignalR WebSocket Hub to connected clients
            await _hubContext.Clients.All.ReceiveWorkflowExecution(
                dto.WorkflowName,
                result.State,
                result.AnomalyScore
            );

            if (state == "AnomalyDetected")
            {
                await _hubContext.Clients.All.ReceiveSystemAlert(
                    "warning",
                    $"IsolationForest model detected performance anomaly in '{dto.WorkflowName}' (Score: {result.AnomalyScore})."
                );
            }

            return Ok(result);
        }

        [HttpPost("webhook/anomaly-alert")]
        public async Task<IActionResult> HandleAnomalyWebhook([FromBody] AnomalyWebhookPayloadDto payload)
        {
            // Find Anomaly Detection Alerting Workflow and increment total executions
            var index = _workflowsStore.FindIndex(w => w.Name.Contains("Anomaly Detection"));
            if (index != -1)
            {
                var wf = _workflowsStore[index];
                _workflowsStore[index] = wf with { TotalExecutions = wf.TotalExecutions + 1 };
            }

            var workflowName = index != -1 ? _workflowsStore[index].Name : "Anomaly Detection Alerting Workflow";

            // Broadcast real-time execution & system alert via SignalR to web and mobile clients
            await _hubContext.Clients.All.ReceiveWorkflowExecution(
                workflowName,
                "AnomalyDetected",
                payload.AnomalyScore
            );

            await _hubContext.Clients.All.ReceiveSystemAlert(
                "critical",
                $"[FastAPI Webhook Alert] Scikit-Learn IsolationForest anomaly detected! Score: {payload.AnomalyScore} (Duration: {payload.ExecutionDurationMs}ms, Payload: {payload.PayloadSizeKb}KB)."
            );

            return Ok(new
            {
                status = "Processed",
                workflowExecuted = workflowName,
                signalrBroadcastSent = true,
                processedAt = DateTime.UtcNow
            });
        }
    }

    public record AnomalyWebhookPayloadDto(
        string SourceService,
        double AnomalyScore,
        bool IsAnomaly,
        double ExecutionDurationMs,
        double PayloadSizeKb,
        double DecisionScore,
        string DetectedAt
    );
}

