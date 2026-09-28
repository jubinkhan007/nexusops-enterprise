using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class CanaryDeploymentControllerTests
    {
        [Fact]
        public void GetCanaryStatus_ReturnsValidRolloutStatusAndMetrics()
        {
            // Arrange
            var controller = new CanaryDeploymentController();

            // Act
            var result = controller.GetCanaryStatus() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var status = result.Value as CanaryDeploymentController.CanaryStatusDto;
            Assert.NotNull(status);
            Assert.Equal("nexusops-backend-canary", status.RolloutName);
            Assert.Equal(25, status.CanaryWeightPercentage);
            Assert.Equal(75, status.StableWeightPercentage);
            Assert.Equal(3, status.AnalysisMetrics.Count);
        }

        [Fact]
        public void PromoteCanary_StepPromotion_ReturnsNewWeight()
        {
            // Arrange
            var controller = new CanaryDeploymentController();
            var request = new CanaryDeploymentController.PromoteRequest { FullPromotion = false };

            // Act
            var result = controller.PromoteCanary(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }

        [Fact]
        public void AbortRollback_ReturnsZeroDowntimeRollback()
        {
            // Arrange
            var controller = new CanaryDeploymentController();

            // Act
            var result = controller.AbortRollback() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }
    }
}
