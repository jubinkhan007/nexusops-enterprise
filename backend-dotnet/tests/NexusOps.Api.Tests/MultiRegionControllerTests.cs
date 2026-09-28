using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class MultiRegionControllerTests
    {
        [Fact]
        public void GetTopology_ReturnsActiveActiveNodesAndSla()
        {
            // Arrange
            var controller = new MultiRegionController();

            // Act
            var result = controller.GetTopology() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var topology = result.Value as MultiRegionController.MultiRegionTopologyDto;
            Assert.NotNull(topology);
            Assert.Equal("us-east-1", topology.ActiveRegion);
            Assert.Equal("eu-west-1", topology.FailoverRegion);
            Assert.Equal(3, topology.Nodes.Count);
            Assert.True(topology.RpoSlaSeconds <= 1.0);
            Assert.True(topology.RtoSlaSeconds <= 5.0);
        }

        [Fact]
        public void TriggerFailover_ValidRequest_ReturnsCompletedFailover()
        {
            // Arrange
            var controller = new MultiRegionController();
            var request = new MultiRegionController.FailoverTriggerRequest
            {
                TargetRegion = "eu-west-1",
                Reason = "Simulated Region Outage"
            };

            // Act
            var result = controller.TriggerFailover(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }

        [Fact]
        public void TriggerFailover_MissingTargetRegion_ReturnsBadRequest()
        {
            // Arrange
            var controller = new MultiRegionController();
            var request = new MultiRegionController.FailoverTriggerRequest
            {
                TargetRegion = ""
            };

            // Act
            var result = controller.TriggerFailover(request) as BadRequestObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }
    }
}
