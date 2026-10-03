using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class IapControllerTests
    {
        [Fact]
        public void GetSession_ReturnsValidIapSession()
        {
            var controller = new IapController();
            var result = controller.GetSession() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var session = result.Value as IapSessionStatus;
            Assert.NotNull(session);
            Assert.True(session.IsMtlsValidated);
            Assert.Equal("SecOpsAdmin", session.Role);
        }

        [Fact]
        public void AuthorizeRequest_AllowsValidSecOpsRole()
        {
            var controller = new IapController();
            var request = new IapAuthorizationRequest
            {
                ResourceUrl = "/api/multicloud/status",
                HttpMethod = "GET",
                UserRole = "SecOpsAdmin",
                RequireMtls = true
            };

            var result = controller.AuthorizeRequest(request) as OkObjectResult;
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var response = result.Value as IapAuthorizationResponse;
            Assert.NotNull(response);
            Assert.True(response.Authorized);
            Assert.Contains("ALLOWED", response.Decision);
        }

        [Fact]
        public void GetPolicies_ReturnsZeroTrustPolicies()
        {
            var controller = new IapController();
            var result = controller.GetPolicies() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }
    }
}
