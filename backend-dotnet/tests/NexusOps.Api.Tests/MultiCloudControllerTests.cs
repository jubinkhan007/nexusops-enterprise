using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class MultiCloudControllerTests
    {
        [Fact]
        public void GetStatus_ReturnsHealthyMultiCloudTopology()
        {
            var controller = new MultiCloudController();
            var result = controller.GetStatus() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var summary = result.Value as MultiCloudTopologySummary;
            Assert.NotNull(summary);
            Assert.Equal("Active-Active Hybrid Multi-Cloud", summary.TopologyMode);
            Assert.Equal(2, summary.Clusters.Count);
        }

        [Fact]
        public void TriggerFailover_SwitchesPrimaryToGcp()
        {
            var controller = new MultiCloudController();
            var request = new MultiCloudFailoverRequest
            {
                TargetPrimaryCloud = "GCP",
                Reason = "AWS Outage Drill"
            };

            var result = controller.TriggerFailover(request) as OkObjectResult;
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }
    }
}
