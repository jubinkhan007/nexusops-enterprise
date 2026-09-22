using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;
using NexusOps.Api.Controllers;
using NexusOps.Application.DTOs;
using NexusOps.Infrastructure.Hubs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class WorkflowsControllerTests
    {
        private readonly Mock<IHubContext<NotificationHub, INotificationClient>> _mockHubContext;
        private readonly Mock<IHubClients<INotificationClient>> _mockClients;
        private readonly Mock<INotificationClient> _mockNotificationClient;

        public WorkflowsControllerTests()
        {
            _mockHubContext = new Mock<IHubContext<NotificationHub, INotificationClient>>();
            _mockClients = new Mock<IHubClients<INotificationClient>>();
            _mockNotificationClient = new Mock<INotificationClient>();

            _mockClients.Setup(c => c.All).Returns(_mockNotificationClient.Object);
            _mockHubContext.Setup(h => h.Clients).Returns(_mockClients.Object);
        }

        [Fact]
        public void GetWorkflows_ReturnsOkResultWithActiveWorkflows()
        {
            // Arrange
            var controller = new WorkflowsController(_mockHubContext.Object);

            // Act
            var actionResult = controller.GetWorkflows();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var workflows = Assert.IsAssignableFrom<IEnumerable<WorkflowResponseDto>>(okResult.Value);
            Assert.NotEmpty(workflows);
        }

        [Fact]
        public async Task CreateWorkflow_InsertsNewWorkflowAndDispatchesSignalRAlert()
        {
            // Arrange
            var controller = new WorkflowsController(_mockHubContext.Object);
            var dto = new CreateWorkflowRequestDto(
                "Test High Availability Failover",
                "Automated failover workflow for database clusters",
                "DatabaseNodeFailed",
                "{\"cluster\": \"primary\"}",
                "FailoverToSecondary"
            );

            // Act
            var actionResult = await controller.CreateWorkflow(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var createdWorkflow = Assert.IsType<WorkflowResponseDto>(createdResult.Value);
            Assert.Equal(dto.Name, createdWorkflow.Name);

            // Verify SignalR alert broadcast
            _mockNotificationClient.Verify(
                n => n.ReceiveSystemAlert("info", It.Is<string>(s => s.Contains(dto.Name))),
                Times.Once
            );
        }

        [Fact]
        public async Task HandleAnomalyWebhook_IncrementsExecutionCountAndBroadcastsSignalR()
        {
            // Arrange
            var controller = new WorkflowsController(_mockHubContext.Object);
            var payload = new AnomalyWebhookPayloadDto(
                "FastAPI AI Microservice",
                0.892,
                true,
                380.5,
                120.0,
                -0.42,
                DateTime.UtcNow.ToString("o")
            );

            // Act
            var actionResult = await controller.HandleAnomalyWebhook(payload);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            Assert.NotNull(okResult.Value);

            // Verify SignalR broadcasts for both workflow execution and critical alert
            _mockNotificationClient.Verify(
                n => n.ReceiveWorkflowExecution(
                    It.IsAny<string>(),
                    "AnomalyDetected",
                    payload.AnomalyScore
                ),
                Times.Once
            );

            _mockNotificationClient.Verify(
                n => n.ReceiveSystemAlert("critical", It.Is<string>(s => s.Contains("FastAPI Webhook Alert"))),
                Times.Once
            );
        }

        [Fact]
        public async Task TriggerSimulation_ReturnsExecutionResultWithAnomalyScore()
        {
            // Arrange
            var controller = new WorkflowsController(_mockHubContext.Object);
            var request = new SimulationRequestDto(
                "Document Sentiment Pipeline",
                42.5,
                10.0
            );

            // Act
            var actionResult = await controller.TriggerSimulation(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var result = Assert.IsType<ExecutionResultDto>(okResult.Value);
            Assert.Equal("Success", result.State);
            Assert.True(result.AnomalyScore < 0.8);
        }
    }
}
