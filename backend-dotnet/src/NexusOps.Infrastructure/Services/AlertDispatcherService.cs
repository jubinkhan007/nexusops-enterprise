using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace NexusOps.Infrastructure.Services
{
    public class AlertDispatcherService
    {
        private readonly HttpClient _httpClient;
        private static readonly string SlackWebhookUrl = Environment.GetEnvironmentVariable("SLACK_WEBHOOK_URL") ?? "";
        private static readonly string TeamsWebhookUrl = Environment.GetEnvironmentVariable("TEAMS_WEBHOOK_URL") ?? "";
        private static readonly string PagerDutyRoutingKey = Environment.GetEnvironmentVariable("PAGERDUTY_ROUTING_KEY") ?? "";

        public AlertDispatcherService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> SendSlackAlertAsync(string workflowName, double anomalyScore)
        {
            if (string.IsNullOrEmpty(SlackWebhookUrl))
            {
                Console.WriteLine($"[Slack Alert Broadcast] Workflow: '{workflowName}' Anomaly Score: {anomalyScore}");
                return true;
            }

            var payload = new
            {
                text = $"🚨 *NexusOps Anomaly Alert* - Workflow '{workflowName}' Score: {anomalyScore}"
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(SlackWebhookUrl, content);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> SendTeamsAlertAsync(string workflowName, double anomalyScore)
        {
            if (string.IsNullOrEmpty(TeamsWebhookUrl))
            {
                Console.WriteLine($"[MS Teams Alert Broadcast] Workflow: '{workflowName}' Anomaly Score: {anomalyScore}");
                return true;
            }

            var payload = new
            {
                summary = $"NexusOps Anomaly Alert: {workflowName}",
                text = $"🚨 **NexusOps Anomaly Alert**: '{workflowName}' exceeded threshold with score {anomalyScore}"
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(TeamsWebhookUrl, content);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DispatchAllChannelsAsync(string workflowName, double anomalyScore)
        {
            var slackOk = await SendSlackAlertAsync(workflowName, anomalyScore);
            var teamsOk = await SendTeamsAlertAsync(workflowName, anomalyScore);
            return slackOk && teamsOk;
        }
    }
}
