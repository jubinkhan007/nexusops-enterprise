using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class ComplianceControllerTests
    {
        [Fact]
        public void GetSummary_ReturnsValidComplianceScoreAndFrameworks()
        {
            // Arrange
            var controller = new ComplianceController();

            // Act
            var result = controller.GetSummary() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var summary = result.Value as ComplianceController.ComplianceSummaryDto;
            Assert.NotNull(summary);
            Assert.True(summary.OverallScorePercentage >= 95.0);
            Assert.Equal(4, summary.FrameworkStatuses.Count);
            Assert.Equal(5, summary.ControlsAudited.Count);
        }

        [Fact]
        public void TriggerComplianceScan_ReturnsCompletedScanResult()
        {
            // Arrange
            var controller = new ComplianceController();

            // Act
            var result = controller.TriggerComplianceScan() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }
    }
}
