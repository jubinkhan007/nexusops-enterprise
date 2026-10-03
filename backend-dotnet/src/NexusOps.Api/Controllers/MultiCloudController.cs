using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    public class MultiCloudClusterStatus
    {
        public string Provider { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ActivePods { get; set; }
        public double LatencyMs { get; set; }
        public double ReplicationLagSeconds { get; set; }
    }

    public class MultiCloudTopologySummary
    {
        public string TopologyMode { get; set; } = "Active-Active Hybrid Multi-Cloud";
        public string ActivePrimaryCloud { get; set; } = "AWS EKS (us-east-1)";
        public string SecondaryCloud { get; set; } = "GCP GKE (us-central1)";
        public int TrafficSplitAwsPct { get; set; } = 50;
        public int TrafficSplitGcpPct { get; set; } = 50;
        public List<MultiCloudClusterStatus> Clusters { get; set; } = new();
        public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
    }

    public class MultiCloudFailoverRequest
    {
        public string TargetPrimaryCloud { get; set; } = "GCP";
        public string Reason { get; set; } = "Manual Failover Drill";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class MultiCloudController : ControllerBase
    {
        private static MultiCloudTopologySummary _topologyState = new MultiCloudTopologySummary
        {
            Clusters = new List<MultiCloudClusterStatus>
            {
                new MultiCloudClusterStatus { Provider = "AWS EKS", Region = "us-east-1", Status = "Healthy", ActivePods = 42, LatencyMs = 12.4, ReplicationLagSeconds = 0.2 },
                new MultiCloudClusterStatus { Provider = "GCP GKE", Region = "us-central1", Status = "Healthy", ActivePods = 42, LatencyMs = 14.1, ReplicationLagSeconds = 0.3 }
            }
        };

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(_topologyState);
        }

        [HttpPost("failover")]
        public IActionResult TriggerFailover([FromBody] MultiCloudFailoverRequest request)
        {
            if (string.Equals(request.TargetPrimaryCloud, "GCP", StringComparison.OrdinalIgnoreCase))
            {
                _topologyState.ActivePrimaryCloud = "GCP GKE (us-central1)";
                _topologyState.SecondaryCloud = "AWS EKS (us-east-1)";
                _topologyState.TrafficSplitAwsPct = 10;
                _topologyState.TrafficSplitGcpPct = 90;
            }
            else
            {
                _topologyState.ActivePrimaryCloud = "AWS EKS (us-east-1)";
                _topologyState.SecondaryCloud = "GCP GKE (us-central1)";
                _topologyState.TrafficSplitAwsPct = 90;
                _topologyState.TrafficSplitGcpPct = 10;
            }

            _topologyState.LastSyncedAt = DateTime.UtcNow;
            return Ok(new
            {
                Message = $"Cross-Cloud Failover Executed Successfully to {request.TargetPrimaryCloud}",
                Topology = _topologyState
            });
        }
    }
}
