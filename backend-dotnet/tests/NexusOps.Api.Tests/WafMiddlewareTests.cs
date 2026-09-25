using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using NexusOps.Api.Middleware;
using Xunit;

namespace NexusOps.Api.Tests
{
    public class WafMiddlewareTests
    {
        private readonly Mock<ILogger<WafSecurityMiddleware>> _mockWafLogger;
        private readonly Mock<ILogger<RateLimitingMiddleware>> _mockRateLogger;

        public WafMiddlewareTests()
        {
            _mockWafLogger = new Mock<ILogger<WafSecurityMiddleware>>();
            _mockRateLogger = new Mock<ILogger<RateLimitingMiddleware>>();
        }

        [Fact]
        public async Task WafSecurityMiddleware_BlocksSqlInjectionQuery_ReturnsForbidden403()
        {
            // Arrange
            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new WafSecurityMiddleware(next, _mockWafLogger.Object);

            var context = new DefaultHttpContext();
            context.Request.QueryString = new QueryString("?query=UNION SELECT * FROM users");
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.False(nextCalled, "Next middleware should not be invoked when WAF blocks request.");
            Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        }

        [Fact]
        public async Task WafSecurityMiddleware_BlocksXssHeader_ReturnsForbidden403()
        {
            // Arrange
            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new WafSecurityMiddleware(next, _mockWafLogger.Object);

            var context = new DefaultHttpContext();
            context.Request.Headers["User-Agent"] = "<script>alert('xss')</script>";
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.False(nextCalled);
            Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        }

        [Fact]
        public async Task WafSecurityMiddleware_AllowsCleanRequest_CallsNext()
        {
            // Arrange
            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new WafSecurityMiddleware(next, _mockWafLogger.Object);

            var context = new DefaultHttpContext();
            context.Request.QueryString = new QueryString("?search=analytics");
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextCalled, "Next middleware should be invoked for clean requests.");
            Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        }

        [Fact]
        public async Task RateLimitingMiddleware_NormalTraffic_InjectsHeadersAndCallsNext()
        {
            // Arrange
            bool nextCalled = false;
            RequestDelegate next = (ctx) =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new RateLimitingMiddleware(next, _mockRateLogger.Object);

            var context = new DefaultHttpContext();
            context.Request.Headers["X-Tenant-ID"] = "tenant-test-123";
            context.Response.Body = new MemoryStream();

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextCalled);
            Assert.True(context.Response.Headers.ContainsKey("X-RateLimit-Limit"));
            Assert.True(context.Response.Headers.ContainsKey("X-RateLimit-Remaining"));
        }
    }
}
