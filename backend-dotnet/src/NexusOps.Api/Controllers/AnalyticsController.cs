using Microsoft.AspNetCore.Mvc;
using NexusOps.Application.DTOs;
using System.Threading.Tasks;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        [HttpGet("summary")]
        public ActionResult<SystemAnalyticsSummaryDto> GetSummary()
        {
            var summary = new SystemAnalyticsSummaryDto(
                ActiveWorkflowsCount: 14,
                TotalExecutionsCount: 24890,
                AnomalyCount: 12,
                AverageExecutionTimeMs: 42.5,
                DocumentsProcessed: 1240,
                SystemHealthScore: 99.4
            );

            return Ok(summary);
        }
    }
}
