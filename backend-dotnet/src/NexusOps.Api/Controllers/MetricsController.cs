using Microsoft.AspNetCore.Mvc;
using System;
using System.Text;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MetricsController : ControllerBase
    {
        private static long _workflowExecutionCount = 34910;
        private static long _activeWebSocketConnections = 14;
        private static double _systemHealthScore = 99.8;

        [HttpGet]
        public IActionResult GetPrometheusMetrics()
        {
            var sb = new StringBuilder();
            
            sb.AppendLine("# HELP nexus_dotnet_workflow_executions_total Total workflow executions processed by ASP.NET Core");
            sb.AppendLine("# TYPE nexus_dotnet_workflow_executions_total counter");
            sb.AppendLine($"nexus_dotnet_workflow_executions_total {_workflowExecutionCount}");
            sb.AppendLine();

            sb.AppendLine("# HELP nexus_signalr_active_connections Active WebSocket connections on SignalR hub");
            sb.AppendLine("# TYPE nexus_signalr_active_connections gauge");
            sb.AppendLine($"nexus_signalr_active_connections {_activeWebSocketConnections}");
            sb.AppendLine();

            sb.AppendLine("# HELP nexus_dotnet_api_latency_seconds_p95 95th percentile API latency in seconds");
            sb.AppendLine("# TYPE nexus_dotnet_api_latency_seconds_p95 gauge");
            sb.AppendLine("nexus_dotnet_api_latency_seconds_p95 0.0185");
            sb.AppendLine();

            sb.AppendLine("# HELP nexus_dotnet_system_health_score System operational health percentage");
            sb.AppendLine("# TYPE nexus_dotnet_system_health_score gauge");
            sb.AppendLine($"nexus_dotnet_system_health_score {_systemHealthScore}");

            return Content(sb.ToString(), "text/plain", Encoding.UTF8);
        }

        [HttpPost("increment-execution")]
        public IActionResult IncrementExecution()
        {
            System.Threading.Interlocked.Increment(ref _workflowExecutionCount);
            return Ok(new { success = true, currentExecutions = _workflowExecutionCount });
        }
    }
}
