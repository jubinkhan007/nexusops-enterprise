using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class HealthControllerTests
    {
        [Fact]
        public void GetDetailedHealth_ReturnsHealthyStatusAndResilienceSla()
        {
            // Arrange
            var controller = new HealthController();

            // Act
            var result = controller.GetDetailedHealth() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            
            var data = result.Value as DetailedHealthResponse;
            Assert.NotNull(data);
            Assert.Equal("Healthy", data.Status);
            Assert.Equal("99.99% High Availability", data.ResilienceSla);
            Assert.Equal("HA-RESILIENCE-PASSED-2026", data.ChaosTestingCertificate);
        }
    }
}
