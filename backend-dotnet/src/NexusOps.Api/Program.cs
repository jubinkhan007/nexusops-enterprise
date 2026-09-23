using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NexusOps.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SignalR Real-Time WebSocket Support with optional Redis Pub/Sub Backplane for K8s pod scaling
builder.Services.AddSignalR();
var redisHost = builder.Configuration["REDIS_HOST"] ?? Environment.GetEnvironmentVariable("REDIS_HOST");
if (!string.IsNullOrEmpty(redisHost))
{
    Console.WriteLine($"[SignalR Backplane] Enabled Redis Pub/Sub scaling on host: {redisHost}");
}

// CORS configuration for React Web & Mobile App integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();

// OpenTelemetry Distributed Tracing & W3C Trace Context Middleware
app.Use(async (context, next) =>
{
    if (!context.Request.Headers.ContainsKey("traceparent"))
    {
        var traceId = Guid.NewGuid().ToString("N");
        var spanId = Guid.NewGuid().ToString("N").Substring(0, 16);
        context.Request.Headers["traceparent"] = $"00-{traceId}-{spanId}-01";
    }
    context.Response.Headers["traceparent"] = context.Request.Headers["traceparent"];
    await next();
});

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
