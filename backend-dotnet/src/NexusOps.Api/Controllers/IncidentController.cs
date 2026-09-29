using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncidentController : ControllerBase
    {
        public class IncidentDto
        {
            public string IncidentId { get; set; } = "INC-94821";
            public string Title { get; set; } = "PostgreSQL Replica Node Latency Spike (High Replication Lag)";
            public string Severity { get; set; } = "P1-CRITICAL";
            public string Service { get; set; } = "database-cluster-us-east-1";
            public string Status { get; set; } = "TRIGGERED";
            public string OnCallEngineer { get; set; } = "Alex Mercer (SRE Primary)";
            public string EscalationTier { get; set; } = "Tier 1 SRE";
            public double MttrMinutes { get; set; } = 8.5;
            public DateTime TriggeredAt { get; set; } = DateTime.UtcNow.AddMinutes(-14);
        }

        public class PostMortemDto
        {
            public string IncidentId { get; set; } = "INC-94821";
            public string Title { get; set; } = "PostgreSQL Replica Node Latency Spike";
            public string RootCause { get; set; } = "High-write batch ingestion query saturated shared_buffers pool, causing WAL sender queue lag.";
            public List<string> Timeline { get; set; } = new()
            {
                "14:02 UTC - Automated anomaly detector flagged 450ms replication lag.",
                "14:03 UTC - PagerDuty P1 incident triggered; Alex Mercer paged.",
                "14:05 UTC - SRE team acknowledged incident; redirected write queries.",
                "14:10.5 UTC - Replication lag normalized; incident resolved."
            };
            public List<string> ActionItems { get; set; } = new()
            {
                "Increase shared_buffers to 8GB in postgresql.conf.",
                "Tune VPA memory limits for database-writer pod.",
                "Add Prometheus alert rule for wal_sender_queue > 50MB."
            };
            public string Status { get; set; } = "APPROVED";
        }

        public class TriggerIncidentRequest
        {
            public string Title { get; set; } = "Synthetic High Load Test Breach";
            public string Severity { get; set; } = "P1-CRITICAL";
            public string Service { get; set; } = "backend-dotnet-api";
        }

        [HttpGet("active")]
        public IActionResult GetActiveIncidents()
        {
            var list = new List<IncidentDto>
            {
                new IncidentDto(),
                new IncidentDto
                {
                    IncidentId = "INC-94820",
                    Title = "Redis Cache Memory Saturation",
                    Severity = "P2-MAJOR",
                    Service = "cache-redis-cluster",
                    Status = "ACKNOWLEDGED",
                    OnCallEngineer = "Sarah Jenkins (SRE Secondary)",
                    EscalationTier = "Tier 2 Infra",
                    MttrMinutes = 12.0,
                    TriggeredAt = DateTime.UtcNow.AddMinutes(-45)
                }
            };
            return Ok(list);
        }

        [HttpPost("trigger")]
        public IActionResult TriggerIncident([FromBody] TriggerIncidentRequest request)
        {
            var incident = new IncidentDto
            {
                IncidentId = "INC-" + Random.Shared.Next(10000, 99999),
                Title = request.Title,
                Severity = request.Severity,
                Service = request.Service,
                Status = "TRIGGERED",
                TriggeredAt = DateTime.UtcNow
            };

            return Ok(new
            {
                Message = "PagerDuty Incident & Slack War Room alert triggered successfully.",
                PagerDutyDedupKey = "pd-" + Guid.NewGuid().ToString("N")[..8],
                Incident = incident
            });
        }

        [HttpPost("{id}/acknowledge")]
        public IActionResult AcknowledgeIncident(string id)
        {
            return Ok(new
            {
                IncidentId = id,
                Status = "ACKNOWLEDGED",
                AcknowledgedBy = "Alex Mercer",
                Message = $"Incident {id} acknowledged. PagerDuty escalation timer paused.",
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("{id}/resolve")]
        public IActionResult ResolveIncident(string id)
        {
            return Ok(new
            {
                IncidentId = id,
                Status = "RESOLVED",
                ResolvedBy = "Alex Mercer",
                MttrMinutes = 8.5,
                Message = $"Incident {id} marked RESOLVED. PagerDuty incident closed.",
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("{id}/postmortem")]
        public IActionResult GetPostMortem(string id)
        {
            var pm = new PostMortemDto { IncidentId = id };
            return Ok(pm);
        }
    }
}
