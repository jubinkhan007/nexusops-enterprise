import * as signalR from '@microsoft/signalr';

const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB || 'http://localhost:5050/hubs/notifications';

export class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public startConnection(
    onExecutionReceived: (workflowName: string, state: string, anomalyScore: number) => void,
    onAlertReceived: (severity: string, message: string) => void
  ) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveWorkflowExecution', (workflowName, state, anomalyScore) => {
      onExecutionReceived(workflowName, state, anomalyScore);
    });

    this.connection.on('ReceiveSystemAlert', (severity, message) => {
      onAlertReceived(severity, message);
    });

    this.connection.start().catch((err) => {
      console.log('[SignalR] Running in simulated mode:', err);
    });
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}

export const signalRService = new SignalRService();
