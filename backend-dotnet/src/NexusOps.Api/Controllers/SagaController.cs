using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Saga;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SagaController : ControllerBase
    {
        private static readonly SagaOrchestrator Orchestrator = new();

        public class ExecuteSagaRequest
        {
            public string WorkflowName { get; set; } = "Data Vector Ingestion Saga";
            public bool SimulateFailure { get; set; } = false;
        }

        [HttpPost("execute")]
        public IActionResult ExecuteSaga([FromBody] ExecuteSagaRequest request)
        {
            var result = Orchestrator.ExecuteSaga(request.WorkflowName, request.SimulateFailure);
            return Ok(result);
        }

        [HttpGet("history")]
        public IActionResult GetSagaHistory()
        {
            var history = Orchestrator.GetSagaHistory();
            return Ok(history);
        }
    }
}
