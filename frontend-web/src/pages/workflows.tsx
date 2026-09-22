import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { CreateWorkflowModal } from '../components/CreateWorkflowModal';
import { fetchWorkflows, toggleWorkflowStatus, WorkflowItem } from '../services/api';
import { Cpu, Plus, Play, Pause, Code, Zap, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuditLog {
  id: string;
  workflowName: string;
  durationMs: number;
  status: 'Success' | 'AnomalyDetected' | 'Running';
  anomalyScore: number;
  timestamp: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-101',
      workflowName: 'Document Sentiment & Classification Pipeline',
      durationMs: 42.5,
      status: 'Success',
      anomalyScore: 0.0245,
      timestamp: '14:18:05'
    },
    {
      id: 'log-102',
      workflowName: 'Anomaly Detection Alerting Workflow',
      durationMs: 180.0,
      status: 'AnomalyDetected',
      anomalyScore: 1.0000,
      timestamp: '14:20:12'
    },
    {
      id: 'log-103',
      workflowName: 'PostgreSQL pgvector Embedding Sync',
      durationMs: 38.2,
      status: 'Success',
      anomalyScore: 0.0120,
      timestamp: '14:22:45'
    }
  ]);

  useEffect(() => {
    fetchWorkflows().then(setWorkflows);
  }, []);

  const handleCreated = (newWf: WorkflowItem) => {
    setWorkflows((prev) => [newWf, ...prev]);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = await toggleWorkflowStatus(id, currentStatus);
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Title & Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>Workflow Automation Engine</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Event Mesh & Rules Evaluator</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Design, evaluate, and inspect event-driven trigger-condition-action workflow rules.</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workflow</span>
          </button>
        </div>

        {/* Active Workflows Grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>Active Trigger-Condition-Action Rules ({workflows.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border ${
                        wf.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {wf.status}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(wf.id, wf.status)}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-800 transition"
                    >
                      {wf.status === 'Active' ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1">{wf.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{wf.description}</p>

                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] text-slate-500 uppercase">Trigger Event</span>
                      <span className="text-blue-400 font-semibold">{wf.triggerEvent}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] text-slate-500 uppercase">Action Handler</span>
                      <span className="text-indigo-400 font-semibold">{wf.actionType}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-900 text-[11px] text-slate-400 truncate flex items-center space-x-1">
                      <Code className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{wf.conditionJson}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span>Executions: <strong className="text-white font-mono">{wf.totalExecutions}</strong></span>
                  <span className="text-[11px]">Clean Arch CQRS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Audit Log Viewer */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Real-Time Execution Audit Trail</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total Logs: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Workflow Name</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">ML Anomaly Score</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-white">{log.workflowName}</td>
                    <td className="py-3 px-4 text-blue-400">{log.durationMs}ms</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={log.anomalyScore > 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
                        {log.anomalyScore.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'AnomalyDetected' ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-sans text-[11px] flex items-center space-x-1 w-fit">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Anomaly Detected</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-sans text-[11px] flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Success</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
