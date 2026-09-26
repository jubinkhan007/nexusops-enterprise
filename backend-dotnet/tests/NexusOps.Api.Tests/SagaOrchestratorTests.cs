using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using NexusOps.Api.Saga;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class SagaOrchestratorTests
    {
        [Fact]
        public void ExecuteSaga_NormalExecution_CompletesAllSteps()
        {
            // Arrange
            var orchestrator = new SagaOrchestrator();

            // Act
            var result = orchestrator.ExecuteSaga("Normal Workflow Test", simulateFailure: false);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Completed", result.Status);
            Assert.Equal("nexusops-saga-events", result.KafkaTopic);
            Assert.Equal(4, result.Steps.Count);
            Assert.All(result.Steps, step => Assert.Equal("Completed", step.Status));
        }

        [Fact]
        public void ExecuteSaga_InjectedFailure_TriggersCompensationRollback()
        {
            // Arrange
            var orchestrator = new SagaOrchestrator();

            // Act
            var result = orchestrator.ExecuteSaga("Failure Injected Workflow", simulateFailure: true);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("RolledBack", result.Status);
            Assert.Contains(result.Steps, step => step.Status == "FAILED");
            Assert.Contains(result.Steps, step => step.Status == "COMPENSATED");
        }

        [Fact]
        public void SagaController_Execute_ReturnsOkResult()
        {
            // Arrange
            var controller = new SagaController();
            var request = new SagaController.ExecuteSagaRequest
            {
                WorkflowName = "Controller Test Saga",
                SimulateFailure = false
            };

            // Act
            var actionResult = controller.ExecuteSaga(request) as OkObjectResult;

            // Assert
            Assert.NotNull(actionResult);
            Assert.Equal(200, actionResult.StatusCode);
            var state = actionResult.Value as SagaExecutionState;
            Assert.NotNull(state);
            Assert.Equal("Completed", state.Status);
        }
    }
}
