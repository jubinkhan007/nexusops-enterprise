using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace NexusOps.Infrastructure.Hubs
{
    public interface INotificationClient
    {
        Task ReceiveWorkflowExecution(string workflowName, string state, double anomalyScore);
        Task ReceiveAIInsight(string title, string summary, double confidence);
        Task ReceiveSystemAlert(string severity, string message);
    }

    public class NotificationHub : Hub<INotificationClient>
    {
        public async Task BroadcastAlert(string severity, string message)
        {
            await Clients.All.ReceiveSystemAlert(severity, message);
        }
    }
}
