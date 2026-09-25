using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace NexusOps.Api.GraphQL
{
    public class GraphQLMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly GraphQLQuery _queryResolver = new();
        private readonly GraphQLMutation _mutationResolver = new();

        public GraphQLMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.Equals("/graphql", StringComparison.OrdinalIgnoreCase))
            {
                // Serve Interactive GraphiQL IDE on GET
                if (HttpMethods.IsGet(context.Request.Method))
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.WriteAsync(GetGraphiQLHtml());
                    return;
                }

                // Process GraphQL JSON Query/Mutation payload on POST
                if (HttpMethods.IsPost(context.Request.Method))
                {
                    using var reader = new StreamReader(context.Request.Body, Encoding.UTF8);
                    var requestBody = await reader.ReadToEndAsync();

                    using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(requestBody) ? "{}" : requestBody);
                    var root = doc.RootElement;

                    string query = root.TryGetProperty("query", out var queryProp) ? queryProp.GetString() ?? "" : "";

                    var responseObj = ExecuteGraphQLQuery(query);
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj, new JsonSerializerOptions { WriteIndented = true }));
                    return;
                }
            }

            await _next(context);
        }

        private object ExecuteGraphQLQuery(string query)
        {
            // Introspection or Schema Query
            if (query.Contains("__schema"))
            {
                return new
                {
                    data = new
                    {
                        __schema = new
                        {
                            queryType = new { name = "GraphQLQuery" },
                            mutationType = new { name = "GraphQLMutation" },
                            types = new[]
                            {
                                new { name = "GraphQLWorkflow", kind = "OBJECT" },
                                new { name = "GraphQLSystemHealth", kind = "OBJECT" },
                                new { name = "GraphQLAuditLog", kind = "OBJECT" },
                                new { name = "GraphQLAiInsights", kind = "OBJECT" }
                            }
                        }
                    }
                };
            }

            // Mutation Execution
            if (query.Contains("mutation") || query.Contains("triggerWorkflow") || query.Contains("dispatchAlert"))
            {
                if (query.Contains("dispatchAlert"))
                {
                    return new
                    {
                        data = new
                        {
                            dispatchAlert = _mutationResolver.DispatchAlert("GraphQL Channel", "Security Audit Notification")
                        }
                    };
                }

                return new
                {
                    data = new
                    {
                        triggerWorkflow = _mutationResolver.TriggerWorkflow("On-Demand GraphQL Execution")
                    }
                };
            }

            // Default Query Execution
            return new
            {
                data = new
                {
                    workflows = _queryResolver.Workflows,
                    systemHealth = _queryResolver.SystemHealth,
                    auditLogs = _queryResolver.AuditLogs,
                    aiInsights = _queryResolver.AiInsights
                }
            };
        }

        private static string GetGraphiQLHtml()
        {
            return @"<!DOCTYPE html>
<html>
<head>
  <title>NexusOps Enterprise GraphQL Gateway</title>
  <link rel=""stylesheet"" href=""https://unpkg.com/graphiql/graphiql.min.css"" />
  <script src=""https://unpkg.com/react/umd/react.production.min.js""></script>
  <script src=""https://unpkg.com/react-dom/umd/react-dom.production.min.js""></script>
  <script src=""https://unpkg.com/graphiql/graphiql.min.js""></script>
</head>
<body style=""margin: 0;"">
  <div id=""graphiql"" style=""height: 100vh;""></div>
  <script>
    const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
    ReactDOM.render(
      React.createElement(GraphiQL, { fetcher: fetcher, defaultQuery: 'query {\n  systemHealth {\n    healthScore\n    p95LatencyMs\n    postgresRlsStatus\n    wafSecurityStatus\n  }\n  workflows {\n    id\n    name\n    status\n  }\n}' }),
      document.getElementById('graphiql')
    );
  </script>
</body>
</html>";
        }
    }
}
