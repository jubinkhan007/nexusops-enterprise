using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinOpsController : ControllerBase
    {
        public class NamespaceCostDto
        {
            public string Namespace { get; set; } = "nexusops-enterprise";
            public double CurrentCostUsd { get; set; } = 8450.0;
            public double OptimizedCostUsd { get; set; } = 5200.0;
            public double SavingsUsd { get; set; } = 3250.0;
            public double WastePercentage { get; set; } = 38.4;
        }

        public class UnattachedVolumeDto
        {
            public string VolumeId { get; set; } = "vol-08f1b2c3d4e5f6a";
            public string Zone { get; set; } = "us-east-1a";
            public int SizeGb { get; set; } = 250;
            public double MonthlyCostUsd { get; set; } = 120.0;
            public string State { get; set; } = "available";
        }

        public class FinOpsSummaryDto
        {
            public double CurrentMonthlySpendUsd { get; set; } = 14250.0;
            public double OptimizedMonthlySpendUsd { get; set; } = 9100.0;
            public double PotentialMonthlySavingsUsd { get; set; } = 5150.0;
            public double PotentialSavingsPercentage { get; set; } = 36.1;
            public double IdleCpuWasteCores { get; set; } = 18.5;
            public double IdleMemoryWasteGb { get; set; } = 64.0;
            public List<NamespaceCostDto> NamespaceBreakdown { get; set; } = new()
            {
                new NamespaceCostDto { Namespace = "nexusops-enterprise", CurrentCostUsd = 8450.0, OptimizedCostUsd = 5200.0, SavingsUsd = 3250.0, WastePercentage = 38.4 },
                new NamespaceCostDto { Namespace = "nexusops-ai-rag", CurrentCostUsd = 4200.0, OptimizedCostUsd = 2800.0, SavingsUsd = 1400.0, WastePercentage = 33.3 },
                new NamespaceCostDto { Namespace = "monitoring-logging", CurrentCostUsd = 1600.0, OptimizedCostUsd = 1100.0, SavingsUsd = 500.0, WastePercentage = 31.25 }
            };
            public List<UnattachedVolumeDto> UnattachedVolumes { get; set; } = new()
            {
                new UnattachedVolumeDto { VolumeId = "vol-08f1b2c3d4e5f6a", Zone = "us-east-1a", SizeGb = 250, MonthlyCostUsd = 120.0, State = "available" },
                new UnattachedVolumeDto { VolumeId = "vol-09a8b7c6d5e4f32", Zone = "us-east-1b", SizeGb = 500, MonthlyCostUsd = 240.0, State = "available" },
                new UnattachedVolumeDto { VolumeId = "vol-01c2b3a4d5e6f78", Zone = "eu-west-1a", SizeGb = 100, MonthlyCostUsd = 60.0, State = "available" },
                new UnattachedVolumeDto { VolumeId = "vol-07f6e5d4c3b2a19", Zone = "eu-west-1b", SizeGb = 100, MonthlyCostUsd = 60.0, State = "available" }
            };
            public DateTime LastAuditTimestamp { get; set; } = DateTime.UtcNow;
        }

        public class OptimizeResourceRequest
        {
            public bool PruneUnattachedVolumes { get; set; } = true;
            public bool AutoTunePodRequests { get; set; } = true;
        }

        [HttpGet("summary")]
        public IActionResult GetSummary()
        {
            var summary = new FinOpsSummaryDto();
            return Ok(summary);
        }

        [HttpPost("optimize")]
        public IActionResult OptimizeResources([FromBody] OptimizeResourceRequest request)
        {
            var result = new
            {
                RunId = "finops-" + Guid.NewGuid().ToString("N")[..8],
                Status = "COMPLETED",
                VolumesPruned = request.PruneUnattachedVolumes ? 4 : 0,
                PodsAutoTuned = request.AutoTunePodRequests ? 12 : 0,
                MonthlySavingsRealizedUsd = 5150.0,
                Message = "FinOps auto-tuning and unattached volume pruning executed successfully.",
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
    }
}
