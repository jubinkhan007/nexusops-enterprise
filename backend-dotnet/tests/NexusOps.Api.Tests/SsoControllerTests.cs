using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using NexusOps.Api.Controllers;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class SsoControllerTests
    {
        [Fact]
        public void GetSamlMetadata_ReturnsValidXmlEntityDescriptor()
        {
            // Arrange
            var controller = new SsoController();

            // Act
            var result = controller.GetSamlMetadata() as ContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("application/xml", result.ContentType);
            Assert.Contains("EntityDescriptor", result.Content);
            Assert.Contains("AssertionConsumerService", result.Content);
        }

        [Fact]
        public void ProcessSsoCallback_MapsOktaAdminGroup_ReturnsAdminRoleToken()
        {
            // Arrange
            var controller = new SsoController();
            var request = new SsoCallbackRequest
            {
                Email = "admin@nexusops.io",
                Provider = "Okta-SAML2",
                Groups = new List<string> { "NexusOps_Admins", "Engineering" }
            };

            // Act
            var result = controller.ProcessSsoCallback(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var response = result.Value as SsoAuthResponse;
            Assert.NotNull(response);
            Assert.Equal("Admin", response.Role);
            Assert.NotNull(response.Token);
        }

        [Fact]
        public void ProcessSsoCallback_MapsOktaAuditorGroup_ReturnsAuditorRoleToken()
        {
            // Arrange
            var controller = new SsoController();
            var request = new SsoCallbackRequest
            {
                Email = "auditor@nexusops.io",
                Provider = "AzureAD-OIDC",
                Groups = new List<string> { "Compliance_Auditors" }
            };

            // Act
            var result = controller.ProcessSsoCallback(request) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var response = result.Value as SsoAuthResponse;
            Assert.NotNull(response);
            Assert.Equal("Auditor", response.Role);
            Assert.Equal("AzureAD-OIDC", response.Provider);
        }
    }
}
