using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class FinOpsControllerTests
    {
        [Fact]
        public void GetSummary_ReturnsValidCostSavingsAndVolumes()
        {
            // Arrange
            var controller = new FinOpsController();

            // Act
            var result = controller.GetSummary() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var summary = result.Value as FinOpsController.FinOpsSummaryDto;
            Assert.NotNull(summary);
            Assert.True(summary.CurrentMonthlySpendUsd > summary.OptimizedMonthlySpendUsd);
            Assert.Equal(5150.0, summary.PotentialMonthlySavingsUsd);
            Assert.Equal(3, summary.NamespaceBreakdown.Count);
            Assert.Equal(4, summary.UnattachedVolumes.Count);
        }

        [Fact]
        public void OptimizeResources_ValidRequest_ReturnsCompletedOptimization()
        {
            // Arrange
            var controller = new FinOpsController();
            var request = new FinOpsController.OptimizeResourceRequest
            {
                PruneUnattachedVolumes = true,
                AutoTunePodRequests = true
            };

            // Act
            var result = controller.OptimizeResources(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }
    }
}
