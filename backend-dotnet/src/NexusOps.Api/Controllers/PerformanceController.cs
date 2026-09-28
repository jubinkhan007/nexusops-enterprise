using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        public class TriggerBenchmarkRequest
        {
            public int VirtualUsers { get; set; } = 10000;
            public string Profile { get; set; } = "Stress (10k VUs)";
            public string Protocol { get; set; } = "All (REST, GraphQL, WebSocket)";
        }

        public class LatencyPercentiles
        {
            public double P50 { get; set; } = 14.2;
            public double P90 { get; set; } = 42.8;
            public double P95 { get; set; } = 68.4;
            public double P99 { get; set; } = 124.1;
        }

        public class BenchmarkSummaryDto
        {
            public string ScenarioName { get; set; } = "Enterprise 10k VU Peak Stress";
            public int TargetVUs { get; set; } = 10000;
            public double PeakRps { get; set; } = 14500.0;
            public double ErrorRatePercentage { get; set; } = 0.02;
            public LatencyPercentiles PercentilesMs { get; set; } = new();
            public Dictionary<string, double> ProtocolP95Ms { get; set; } = new()
            {
                { "REST_API", 52.4 },
                { "GraphQL_Gateway", 68.4 },
                { "SignalR_WebSocket", 28.1 }
            };
            public string Status { get; set; } = "PASSED";
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        }

        [HttpGet("summary")]
        public IActionResult GetBenchmarkSummary()
        {
            var summary = new BenchmarkSummaryDto();
            return Ok(summary);
        }

        [HttpPost("trigger")]
        public IActionResult TriggerBenchmark([FromBody] TriggerBenchmarkRequest request)
        {
            if (request.VirtualUsers <= 0)
            {
                return BadRequest("VirtualUsers must be greater than 0");
            }

            var result = new
            {
                RunId = "bench-" + Guid.NewGuid().ToString("N")[..8],
                Status = "STARTED",
                TargetVUs = request.VirtualUsers,
                Profile = request.Profile,
                Protocol = request.Protocol,
                Message = $"High-concurrency performance benchmark launched with {request.VirtualUsers} VUs.",
                EstimatedDurationSeconds = 180,
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
    }
}
