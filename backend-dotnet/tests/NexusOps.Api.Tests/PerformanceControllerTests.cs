using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class PerformanceControllerTests
    {
        [Fact]
        public void GetBenchmarkSummary_ReturnsValidSummaryAndSlaStatus()
        {
            // Arrange
            var controller = new PerformanceController();

            // Act
            var result = controller.GetBenchmarkSummary() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var summary = result.Value as PerformanceController.BenchmarkSummaryDto;
            Assert.NotNull(summary);
            Assert.Equal("Enterprise 10k VU Peak Stress", summary.ScenarioName);
            Assert.Equal(10000, summary.TargetVUs);
            Assert.Equal("PASSED", summary.Status);
            Assert.True(summary.PercentilesMs.P95 < 200.0);
            Assert.True(summary.ProtocolP95Ms.ContainsKey("REST_API"));
            Assert.True(summary.ProtocolP95Ms.ContainsKey("GraphQL_Gateway"));
            Assert.True(summary.ProtocolP95Ms.ContainsKey("SignalR_WebSocket"));
        }

        [Fact]
        public void TriggerBenchmark_ValidRequest_ReturnsStartedStatus()
        {
            // Arrange
            var controller = new PerformanceController();
            var request = new PerformanceController.TriggerBenchmarkRequest
            {
                VirtualUsers = 10000,
                Profile = "Stress (10k VUs)",
                Protocol = "All"
            };

            // Act
            var result = controller.TriggerBenchmark(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }

        [Fact]
        public void TriggerBenchmark_InvalidVUs_ReturnsBadRequest()
        {
            // Arrange
            var controller = new PerformanceController();
            var request = new PerformanceController.TriggerBenchmarkRequest
            {
                VirtualUsers = 0
            };

            // Act
            var result = controller.TriggerBenchmark(request) as BadRequestObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }
    }
}
