using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace NexusOps.Api.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private static readonly ConcurrentDictionary<string, ClientRateLimitState> CounterStore = new();

        private const int PermittedLimit = 100;
        private static readonly TimeSpan WindowDuration = TimeSpan.FromMinutes(1);

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var tenantId = context.Request.Headers["X-Tenant-ID"].ToString();
            var clientKey = string.IsNullOrEmpty(tenantId) ? clientIp : $"{tenantId}:{clientIp}";

            var now = DateTime.UtcNow;

            var state = CounterStore.AddOrUpdate(
                clientKey,
                key => new ClientRateLimitState { WindowStart = now, RequestCount = 1 },
                (key, existing) =>
                {
                    lock (existing)
                    {
                        if (now - existing.WindowStart > WindowDuration)
                        {
                            existing.WindowStart = now;
                            existing.RequestCount = 1;
                        }
                        else
                        {
                            existing.RequestCount++;
                        }
                        return existing;
                    }
                });

            int currentCount;
            TimeSpan timeElapsed;

            lock (state)
            {
                currentCount = state.RequestCount;
                timeElapsed = now - state.WindowStart;
            }

            var remaining = Math.Max(0, PermittedLimit - currentCount);
            var secondsUntilReset = Math.Max(1, (int)(WindowDuration - timeElapsed).TotalSeconds);

            context.Response.Headers["X-RateLimit-Limit"] = PermittedLimit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();

            if (currentCount > PermittedLimit)
            {
                context.Response.Headers["Retry-After"] = secondsUntilReset.ToString();
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.ContentType = "application/json";

                _logger.LogWarning("[RATE LIMIT] Client {ClientKey} exceeded rate limit ({Count}/{Limit}).",
                    clientKey, currentCount, PermittedLimit);

                var jsonResponse = $@"{{
  ""error"": ""Too Many Requests"",
  ""message"": ""Rate limit exceeded. Please wait before retrying."",
  ""limit"": {PermittedLimit},
  ""retryAfterSeconds"": {secondsUntilReset},
  ""timestamp"": ""{DateTime.UtcNow:o}""
}}";

                await context.Response.WriteAsync(jsonResponse);
                return;
            }

            await _next(context);
        }

        private class ClientRateLimitState
        {
            public DateTime WindowStart { get; set; }
            public int RequestCount { get; set; }
        }
    }
}
