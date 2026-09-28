using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CanaryDeploymentController : ControllerBase
    {
        public class AnalysisMetricDto
        {
            public string MetricName { get; set; } = "success-rate";
            public string Status { get; set; } = "PASS";
            public string Value { get; set; } = "99.98%";
            public string Threshold { get; set; } = ">= 99.5%";
        }

        public class CanaryStatusDto
        {
            public string RolloutName { get; set; } = "nexusops-backend-canary";
            public string ActiveVersion { get; set; } = "v2.4.0-canary";
            public string StableVersion { get; set; } = "v2.3.9-stable";
            public int CurrentStepIndex { get; set; } = 2;
            public int TotalSteps { get; set; } = 4;
            public int CanaryWeightPercentage { get; set; } = 25;
            public int StableWeightPercentage { get; set; } = 75;
            public string Phase { get; set; } = "Progressing";
            public List<AnalysisMetricDto> AnalysisMetrics { get; set; } = new()
            {
                new AnalysisMetricDto { MetricName = "success-rate", Status = "PASS", Value = "99.98%", Threshold = ">= 99.5%" },
                new AnalysisMetricDto { MetricName = "p95-latency", Status = "PASS", Value = "42.1 ms", Threshold = "<= 200.0 ms" },
                new AnalysisMetricDto { MetricName = "http-error-rate", Status = "PASS", Value = "0.02%", Threshold = "<= 0.50%" }
            };
            public DateTime RolloutStartTime { get; set; } = DateTime.UtcNow.AddMinutes(-12);
        }

        public class PromoteRequest
        {
            public bool FullPromotion { get; set; } = false;
        }

        [HttpGet("canary-status")]
        public IActionResult GetCanaryStatus()
        {
            var status = new CanaryStatusDto();
            return Ok(status);
        }

        [HttpPost("promote")]
        public IActionResult PromoteCanary([FromBody] PromoteRequest request)
        {
            var result = new
            {
                RolloutId = "rollout-" + Guid.NewGuid().ToString("N")[..8],
                Status = request.FullPromotion ? "FULLY_PROMOTED" : "STEP_PROMOTED",
                NewCanaryWeight = request.FullPromotion ? 100 : 50,
                NewStableWeight = request.FullPromotion ? 0 : 50,
                Message = request.FullPromotion
                    ? "Full promotion executed. 100% traffic routed to v2.4.0."
                    : "Step 3 promoted successfully. 50% traffic shifted to v2.4.0 canary.",
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }

        [HttpPost("rollback")]
        public IActionResult AbortRollback()
        {
            var result = new
            {
                RolloutId = "rollout-" + Guid.NewGuid().ToString("N")[..8],
                Status = "ROLLED_BACK",
                CanaryWeight = 0,
                StableWeight = 100,
                RestoredVersion = "v2.3.9-stable",
                Message = "Argo Rollout aborted & automatically rolled back to stable version v2.3.9. Zero downtime.",
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
    }
}
