using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using System.Collections.Generic;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class IncidentControllerTests
    {
        [Fact]
        public void GetActiveIncidents_ReturnsActiveIncidentsList()
        {
            // Arrange
            var controller = new IncidentController();

            // Act
            var result = controller.GetActiveIncidents() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var list = result.Value as List<IncidentController.IncidentDto>;
            Assert.NotNull(list);
            Assert.True(list.Count >= 2);
            Assert.Equal("P1-CRITICAL", list[0].Severity);
        }

        [Fact]
        public void TriggerIncident_ValidRequest_ReturnsTriggeredIncident()
        {
            // Arrange
            var controller = new IncidentController();
            var request = new IncidentController.TriggerIncidentRequest
            {
                Title = "Service Outage",
                Severity = "P1-CRITICAL",
                Service = "database-cluster"
            };

            // Act
            var result = controller.TriggerIncident(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            dynamic val = result.Value;
            Assert.NotNull(val);
        }

        [Fact]
        public void AcknowledgeAndResolve_ChangesStatusCleanly()
        {
            // Arrange
            var controller = new IncidentController();

            // Act
            var ackResult = controller.AcknowledgeIncident("INC-94821") as OkObjectResult;
            var resResult = controller.ResolveIncident("INC-94821") as OkObjectResult;

            // Assert
            Assert.NotNull(ackResult);
            Assert.Equal(200, ackResult.StatusCode);
            Assert.NotNull(resResult);
            Assert.Equal(200, resResult.StatusCode);
        }

        [Fact]
        public void GetPostMortem_ReturnsPostMortemDetails()
        {
            // Arrange
            var controller = new IncidentController();

            // Act
            var result = controller.GetPostMortem("INC-94821") as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var pm = result.Value as IncidentController.PostMortemDto;
            Assert.NotNull(pm);
            Assert.Equal("INC-94821", pm.IncidentId);
            Assert.True(pm.Timeline.Count >= 3);
            Assert.True(pm.ActionItems.Count >= 2);
        }
    }
}
