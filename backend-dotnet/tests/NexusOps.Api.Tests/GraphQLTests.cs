using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using NexusOps.Api.GraphQL;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class GraphQLTests
    {
        [Fact]
        public async Task GraphQL_GetRequest_ReturnsGraphiQLHtmlIDE()
        {
            // Arrange
            var middleware = new GraphQLMiddleware(ctx => Task.CompletedTask);
            var context = new DefaultHttpContext();
            context.Request.Method = "GET";
            context.Request.Path = "/graphql";
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal("text/html", context.Response.ContentType);
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Response.Body);
            var html = await reader.ReadToEndAsync();
            Assert.Contains("NexusOps Enterprise GraphQL Gateway", html);
        }

        [Fact]
        public async Task GraphQL_PostQuery_ReturnsWorkflowsAndSystemHealth()
        {
            // Arrange
            var middleware = new GraphQLMiddleware(ctx => Task.CompletedTask);
            var context = new DefaultHttpContext();
            context.Request.Method = "POST";
            context.Request.Path = "/graphql";
            
            var jsonPayload = "{\"query\": \"query { workflows { id name } systemHealth { healthScore } }\"}";
            context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(jsonPayload));
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal("application/json", context.Response.ContentType);
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Response.Body);
            var json = await reader.ReadToEndAsync();
            Assert.Contains("workflows", json);
            Assert.Contains("systemHealth", json);
            Assert.Contains("99.8%", json);
        }

        [Fact]
        public async Task GraphQL_PostMutation_ExecutesTriggerWorkflow()
        {
            // Arrange
            var middleware = new GraphQLMiddleware(ctx => Task.CompletedTask);
            var context = new DefaultHttpContext();
            context.Request.Method = "POST";
            context.Request.Path = "/graphql";

            var jsonPayload = "{\"query\": \"mutation { triggerWorkflow(name: \\\"On-Demand Scan\\\") { id status } }\"}";
            context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(jsonPayload));
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal("application/json", context.Response.ContentType);
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Response.Body);
            var json = await reader.ReadToEndAsync();
            Assert.Contains("triggerWorkflow", json);
            Assert.Contains("Running", json);
        }
    }
}
