using System;

namespace NexusOps.Api.GraphQL
{
    public class GraphQLMutation
    {
        public GraphQLWorkflow TriggerWorkflow(string name, string? tenantId = null)
        {
            return new GraphQLWorkflow
            {
                Id = $"wf-{Guid.NewGuid().ToString("N").Substring(0, 8)}",
                Name = name,
                Status = "Running",
                ExecutionDurationMs = 0,
                TriggeredBy = tenantId ?? "GraphQL Gateway"
            };
        }

        public GraphQLAlertResponse DispatchAlert(string channel, string message)
        {
            return new GraphQLAlertResponse
            {
                Success = true,
                Channel = channel,
                DispatchedAt = DateTime.UtcNow.ToString("o"),
                Message = $"[GraphQL Gateway Alert] {message}"
            };
        }
    }

    public class GraphQLAlertResponse
    {
        public bool Success { get; set; }
        public string Channel { get; set; } = string.Empty;
        public string DispatchedAt { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
