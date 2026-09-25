using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace NexusOps.Api.Middleware
{
    public class WafSecurityMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<WafSecurityMiddleware> _logger;

        // Compiled regular expressions for WAF signature detection
        private static readonly Regex SqlInjectionPattern = new Regex(
            @"(?i)(\b(UNION\s+SELECT|SELECT\s+.*\s+FROM|INSERT\s+INTO|DELETE\s+FROM|DROP\s+TABLE|ALTER\s+TABLE|EXEC(UTE)?\s+)\b|' OR '1'='1|--|;\s*SHUTDOWN)",
            RegexOptions.Compiled);

        private static readonly Regex XssPattern = new Regex(
            @"(?i)(<script[^>]*>|javascript:|vbscript:|onload\s*=|onerror\s*=|document\.cookie|<iframe|<object|<embed)",
            RegexOptions.Compiled);

        private static readonly Regex PathTraversalPattern = new Regex(
            @"(?i)(\.\./\.\./|\.\.\\\.\.\\|/etc/passwd|/etc/shadow|c:\\windows\\system32)",
            RegexOptions.Compiled);

        public WafSecurityMiddleware(RequestDelegate next, ILogger<WafSecurityMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // 1. Inspect Query String
            var queryString = context.Request.QueryString.Value ?? string.Empty;
            if (InspectPayload(queryString, out string matchedRule))
            {
                await BlockRequestAsync(context, "Query String", matchedRule);
                return;
            }

            // 2. Inspect Request Headers
            foreach (var header in context.Request.Headers)
            {
                if (InspectPayload(header.Value.ToString(), out matchedRule))
                {
                    await BlockRequestAsync(context, $"Header ({header.Key})", matchedRule);
                    return;
                }
            }

            // 3. Inspect Body Payload (for POST/PUT/PATCH)
            if (context.Request.ContentLength > 0 && 
                (context.Request.Method == "POST" || context.Request.Method == "PUT" || context.Request.Method == "PATCH"))
            {
                context.Request.EnableBuffering();
                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                var bodyText = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0; // Reset stream position for downstream controllers

                if (InspectPayload(bodyText, out matchedRule))
                {
                    await BlockRequestAsync(context, "Request Body", matchedRule);
                    return;
                }
            }

            await _next(context);
        }

        private static bool InspectPayload(string input, out string rule)
        {
            rule = string.Empty;
            if (string.IsNullOrWhiteSpace(input)) return false;

            if (SqlInjectionPattern.IsMatch(input))
            {
                rule = "SQL Injection Signature";
                return true;
            }
            if (XssPattern.IsMatch(input))
            {
                rule = "Cross-Site Scripting (XSS) Signature";
                return true;
            }
            if (PathTraversalPattern.IsMatch(input))
            {
                rule = "Path Traversal Signature";
                return true;
            }

            return false;
        }

        private async Task BlockRequestAsync(HttpContext context, string location, string rule)
        {
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            _logger.LogWarning("[WAF ALERT] Blocked malicious request from IP {ClientIp} at location '{Location}'. Rule: {Rule}",
                clientIp, location, rule);

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var jsonResponse = $@"{{
  ""error"": ""Forbidden"",
  ""message"": ""Request blocked by NexusOps Web Application Firewall (WAF)."",
  ""rule"": ""{rule}"",
  ""location"": ""{location}"",
  ""timestamp"": ""{DateTime.UtcNow:o}""
}}";

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
