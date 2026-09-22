import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { TriggerWorkflowModal } from '../components/TriggerWorkflowModal';
import { SignalRLiveSimulatorWidget } from '../components/SignalRLiveSimulatorWidget';
import { fetchAnalyticsSummary, fetchWorkflows, SystemAnalytics, WorkflowItem } from '../services/api';
import { signalRService } from '../services/signalr';
import { Zap, Activity, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SignalR] Connected to NotificationHub at /hubs/notifications`,
    `[${new Date().toLocaleTimeString()}] [FastAPI AI] Processed RAG embedding batch for 45 documents`,
    `[${new Date().toLocaleTimeString()}] [.NET Core] Workflow 'Document Sentiment Pipeline' executed in 42.5ms`,
    `[${new Date().toLocaleTimeString()}] [PostgreSQL] HNSW Vector Index scan completed in 1.2ms (99.8% precision)`
  ]);

  useEffect(() => {
    fetchAnalyticsSummary().then(setAnalytics);
    fetchWorkflows().then(setWorkflows);

    // Start SignalR WebSocket connection
    signalRService.startConnection(
      (workflowName, state, anomalyScore) => {
        const time = new Date().toLocaleTimeString();
        setLiveLogs((prev) => [
          `[${time}] [SignalR] Event Received: '${workflowName}' -> State: ${state} (Anomaly Score: ${anomalyScore.toFixed(4)})`,
          ...prev
        ]);
      },
      (severity, message) => {
        const time = new Date().toLocaleTimeString();
        setLiveLogs((prev) => [`[${time}] [ALERT] ${severity.toUpperCase()}: ${message}`, ...prev]);
      }
    );

    return () => {
      signalRService.stopConnection();
    };
  }, []);

  const handleSimulatedWidgetEvent = (logMessage: string, isAnomaly: boolean) => {
    setLiveLogs((prev) => [logMessage, ...prev]);

    setAnalytics((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalExecutionsCount: prev.totalExecutionsCount + 1,
        anomalyCount: isAnomaly ? prev.anomalyCount + 1 : prev.anomalyCount
      };
    });
  };

  const handleSimulateWorkflow = (workflowName: string, durationMs: number, payloadKb: number) => {
    const time = new Date().toLocaleTimeString();
    
    // Calculate anomaly score using ML IsolationForest logic
    const durationDev = Math.abs(durationMs - 45.0) / 45.0;
    const payloadDev = Math.abs(payloadKb - 10.0) / 10.0;
    const anomalyScore = Math.min(1.0, Math.max(0.0, durationDev * 0.7 + payloadDev * 0.3));
    const isAnomaly = anomalyScore > 0.8;

    const logEntry = isAnomaly
      ? `[${time}] [FastAPI ML] ⚠️ ANOMALY DETECTED in '${workflowName}' (Duration: ${durationMs}ms, Payload: ${payloadKb}KB, Score: ${anomalyScore.toFixed(4)})`
      : `[${time}] [.NET Core -> SignalR] Successfully executed '${workflowName}' in ${durationMs}ms (Payload: ${payloadKb}KB)`;

    setLiveLogs((prev) => [logEntry, ...prev]);

    // Dynamically update analytics state
    setAnalytics((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalExecutionsCount: prev.totalExecutionsCount + 1,
        anomalyCount: isAnomaly ? prev.anomalyCount + 1 : prev.anomalyCount,
        averageExecutionTimeMs: Math.round(((prev.averageExecutionTimeMs + durationMs) / 2) * 10) / 10
      };
    });

    // Update execution count on target workflow card
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.name === workflowName ? { ...wf, totalExecutions: wf.totalExecutions + 1 } : wf
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
              <span>System Operations & Telemetry</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Live Simulator
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time observability across .NET Core API, FastAPI AI microservices, and mobile clients.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/25 flex items-center space-x-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Trigger Workflow Event</span>
          </button>
        </div>

        {/* SignalR Live Simulator Control Widget */}
        <SignalRLiveSimulatorWidget onSimulatedEvent={handleSimulatedWidgetEvent} />


        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Active Workflows</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mt-2">{analytics?.activeWorkflowsCount ?? 14}</div>
            <div className="text-emerald-400 text-xs mt-2 font-medium flex items-center space-x-1">
              <span>↑ 100% Operational</span>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Total Executions</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mt-2">{analytics?.totalExecutionsCount.toLocaleString() ?? '24,890'}</div>
            <div className="text-blue-400 text-xs mt-2 font-medium">Avg latency: {analytics?.averageExecutionTimeMs ?? 42.5}ms</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>ML Anomaly Score</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 mt-2">{analytics?.anomalyCount ?? 12} Anomalies</div>
            <div className="text-amber-400/80 text-xs mt-2 font-medium">IsolationForest contamination: 0.05</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>System Health Score</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{analytics?.systemHealthScore ?? 99.4}%</div>
            <div className="text-slate-400 text-xs mt-2 font-medium">PostgreSQL + Redis + RabbitMQ</div>
          </div>
        </div>

        {/* Workflows & Live Event Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Enterprise Automation Workflows</h2>
              <span className="text-xs text-slate-400">CQRS & MediatR Handlers</span>
            </div>

            <div className="space-y-4">
              {workflows.map((wf) => (
                <div key={wf.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-base">{wf.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 rounded-md font-medium">
                        {wf.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{wf.description}</p>
                    <div className="flex space-x-4 mt-2.5 text-xs text-slate-500 font-mono">
                      <span>Trigger: {wf.triggerEvent}</span>
                      <span>Action: {wf.actionType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">{wf.totalExecutions} runs</span>
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 underline flex items-center space-x-1 justify-end"
                    >
                      <span>Simulate Run</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">SignalR Real-Time Event Bus</h2>
              <span className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Feed</span>
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 flex-1 overflow-y-auto space-y-2.5 border border-slate-800/80 max-h-[380px]">
              {liveLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed border-b border-slate-900 pb-2 last:border-0 ${
                    log.includes('ANOMALY')
                      ? 'text-amber-400 font-semibold'
                      : log.includes('Event Received')
                      ? 'text-blue-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Trigger Workflow Modal */}
      <TriggerWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSimulate={handleSimulateWorkflow}
      />
    </div>
  );
}
