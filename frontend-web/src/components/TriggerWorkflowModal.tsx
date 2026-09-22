import React, { useState } from 'react';
import { X, Play, Zap, AlertTriangle } from 'lucide-react';

interface TriggerWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (workflowName: string, durationMs: number, payloadKb: number) => void;
}

export const TriggerWorkflowModal: React.FC<TriggerWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSimulate
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('Document Sentiment & Classification Pipeline');
  const [durationMs, setDurationMs] = useState(45);
  const [payloadKb, setPayloadKb] = useState(12);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      onSimulate(selectedWorkflow, durationMs, payloadKb);
      setIsRunning(false);
      onClose();
    }, 600);
  };

  const isAnomaly = durationMs > 140 || payloadKb > 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Trigger Live Event Simulation</h3>
              <p className="text-xs text-slate-400">Simulates event dispatch across .NET Core, FastAPI & SignalR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Target Workflow
            </label>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Document Sentiment & Classification Pipeline">Document Sentiment & Classification Pipeline</option>
              <option value="Anomaly Detection Alerting Workflow">Anomaly Detection Alerting Workflow</option>
              <option value="PostgreSQL pgvector Embedding Sync">PostgreSQL pgvector Embedding Sync</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Execution Duration (ms)
              </label>
              <input
                type="number"
                value={durationMs}
                onChange={(e) => setDurationMs(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payload Size (KB)
              </label>
              <input
                type="number"
                value={payloadKb}
                onChange={(e) => setPayloadKb(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Anomaly Preview Banner */}
          <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
            isAnomaly
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {isAnomaly ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Zap className="w-4 h-4 shrink-0" />}
            <span>
              {isAnomaly
                ? 'High execution duration/payload will trigger Scikit-Learn IsolationForest Anomaly Alert!'
                : 'Parameters within normal ML baseline. Standard execution expected.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center space-x-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'Broadcasting Event...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
