using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NexusOps.Api.Controllers
{
    public record AuditLogDto(
        Guid Id,
        string UserId,
        string Action,
        string ResourceName,
        string IpAddress,
        string StateDiffJson,
        string ComplianceCategory,
        DateTime CreatedAt
    );

    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogController : ControllerBase
    {
        private static readonly List<AuditLogDto> _auditLogs = new()
        {
            new(
                Guid.NewGuid(),
                "jubinkhan007@nexusops.enterprise.internal",
                "ROLE_ELEVATED",
                "AuthContext.Role",
                "192.168.1.45",
                "{\"before\": \"Operator\", \"after\": \"Admin\"}",
                "SOC2_TYPE_II",
                DateTime.UtcNow.AddMinutes(-5)
            ),
            new(
                Guid.NewGuid(),
                "fastapi_ai_service",
                "ANOMALY_WEBHOOK_DISPATCHED",
                "FastAPI.IsolationForest",
                "10.0.4.12",
                "{\"anomalyScore\": 0.892, \"executionDurationMs\": 24.1}",
                "HIPAA",
                DateTime.UtcNow.AddMinutes(-12)
            ),
            new(
                Guid.NewGuid(),
                "jubinkhan007@nexusops.enterprise.internal",
                "WORKFLOW_CREATED",
                "Document Sentiment Pipeline",
                "192.168.1.45",
                "{\"status\": \"Active\", \"triggerEvent\": \"DocumentUploaded\"}",
                "SOC2_TYPE_II",
                DateTime.UtcNow.AddMinutes(-25)
            ),
            new(
                Guid.NewGuid(),
                "operator@nexusops.enterprise.internal",
                "VECTOR_RAG_QUERY",
                "PostgreSQL.pgvector",
                "192.168.1.89",
                "{\"query\": \"IsolationForest anomaly threshold\", \"dimension\": 1536}",
                "GDPR",
                DateTime.UtcNow.AddMinutes(-40)
            )
        };

        [HttpGet]
        public ActionResult<IEnumerable<AuditLogDto>> GetAuditLogs(
            [FromQuery] string? category,
            [FromQuery] string? search)
        {
            var query = _auditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(a => a.ComplianceCategory.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => 
                    a.Action.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    a.UserId.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    a.ResourceName.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            return Ok(query.OrderByDescending(a => a.CreatedAt).ToList());
        }

        [HttpPost]
        public ActionResult<AuditLogDto> RecordAuditLog([FromBody] AuditLogDto dto)
        {
            var newEntry = dto with 
            { 
                Id = Guid.NewGuid(), 
                CreatedAt = DateTime.UtcNow 
            };
            _auditLogs.Insert(0, newEntry);
            return CreatedAtAction(nameof(GetAuditLogs), new { id = newEntry.Id }, newEntry);
        }
    }
}
