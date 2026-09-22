import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertOctagon, Zap, Radio, RefreshCw } from 'lucide-react';

interface SignalRLiveSimulatorWidgetProps {
  onSimulatedEvent: (log: string, isAnomaly: boolean) => void;
}

export const SignalRLiveSimulatorWidget: React.FC<SignalRLiveSimulatorWidgetProps> = ({ onSimulatedEvent }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [ratePerSec, setRatePerSec] = useState(4);
  const [anomalyRatio, setAnomalyRatio] = useState(25);
  const [targetEndpoint, setTargetEndpoint] = useState('fastapi-anomaly');
  
  const [stats, setStats] = useState({
    sentCount: 0,
    anomaliesCount: 0,
    webhooksDispatched: 0,
    ragQueriesCount: 0
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      const intervalMs = Math.max(100, Math.round(1000 / ratePerSec));
      interval = setInterval(() => {
        const isAnomaly = Math.random() * 100 < anomalyRatio;
        const durationMs = isAnomaly ? Math.round(220 + Math.random() * 260) : Math.round(18 + Math.random() * 45);
        const payloadKb = isAnomaly ? Math.round(80 + Math.random() * 70) : Math.round(5 + Math.random() * 15);
        const score = isAnomaly ? (0.82 + Math.random() * 0.15).toFixed(4) : (0.05 + Math.random() * 0.30).toFixed(4);

        const timestamp = new Date().toLocaleTimeString();

        if (targetEndpoint === 'fastapi-anomaly') {
          const message = isAnomaly
            ? `[${timestamp}] [FastAPI ML] ⚠️ IsolationForest Anomaly Alert! Score: ${score} (Duration: ${durationMs}ms, Payload: ${payloadKb}KB) -> Webhook dispatched to ASP.NET Core`
            : `[${timestamp}] [FastAPI ML] Telemetry Normal (Score: ${score}, Duration: ${durationMs}ms)`;
          onSimulatedEvent(message, isAnomaly);
        } else if (targetEndpoint === 'dotnet-webhook') {
          const message = `[${timestamp}] [ASP.NET Core Webhook] Received FastAPI alert -> SignalR broadcast to Web, iOS & Android clients (Anomaly Score: ${score})`;
          onSimulatedEvent(message, true);
        } else {
          const queries = ['SignalR reconnect timing', 'pgvector HNSW index', 'IsolationForest contamination', 'Prometheus P95 latency'];
          const q = queries[Math.floor(Math.random() * queries.length)];
          const message = `[${timestamp}] [Gemini RAG] Semantic Query: '${q}' -> pgvector HNSW similarity cosine retrieval in ${durationMs}ms`;
          onSimulatedEvent(message, false);
        }

        setStats((prev) => ({
          sentCount: prev.sentCount + 1,
          anomaliesCount: isAnomaly ? prev.anomaliesCount + 1 : prev.anomaliesCount,
          webhooksDispatched: isAnomaly ? prev.webhooksDispatched + 1 : prev.webhooksDispatched,
          ragQueriesCount: targetEndpoint === 'gemini-rag' ? prev.ragQueriesCount + 1 : prev.ragQueriesCount
        }));
      }, intervalMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, ratePerSec, anomalyRatio, targetEndpoint, onSimulatedEvent]);

  const handleInjectBurst = () => {
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date().toLocaleTimeString();
      const dur = Math.round(310 + Math.random() * 150);
      const score = (0.89 + Math.random() * 0.09).toFixed(4);
      const log = `[${timestamp}] [BURST ALERT] 🚨 IsolationForest Critical Anomaly #${i + 1} (Score: ${score}, Duration: ${dur}ms) -> ASP.NET Core Webhook -> SignalR Push Broadcast`;
      onSimulatedEvent(log, true);
    }
    setStats((prev) => ({
      ...prev,
      sentCount: prev.sentCount + 5,
      anomaliesCount: prev.anomaliesCount + 5,
      webhooksDispatched: prev.webhooksDispatched + 5
    }));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <Radio className="w-3 h-3 animate-pulse text-blue-400" />
              <span>LIVE SIGNALR SIMULATOR</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">ws://localhost:5050/hubs/notifications</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Real-Time Cross-Platform Traffic & Anomaly Generator
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Simulate live load, trigger ML IsolationForest anomalies, test ASP.NET Core webhooks, and push SignalR notifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg ${
              isRunning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Traffic Stream' : 'Start Live Stream'}</span>
          </button>

          <button
            onClick={handleInjectBurst}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-red-600/25 active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Inject 5x Anomaly Burst</span>
          </button>
        </div>
      </div>

      {/* Control Sliders & Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>Target Endpoint</span>
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <select
            value={targetEndpoint}
            onChange={(e) => setTargetEndpoint(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="fastapi-anomaly">FastAPI ML IsolationForest (/anomaly/detect)</option>
            <option value="dotnet-webhook">ASP.NET Core Webhook (/webhook/anomaly-alert)</option>
            <option value="gemini-rag">Gemini pgvector HNSW RAG (/rag/ask)</option>
          </select>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>Concurrency Rate</span>
            <span className="text-blue-400 font-mono font-bold">{ratePerSec} req/sec</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={ratePerSec}
            onChange={(e) => setRatePerSec(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
          />
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>ML Anomaly Spike Probability</span>
            <span className="text-amber-400 font-mono font-bold">{anomalyRatio}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={anomalyRatio}
            onChange={(e) => setAnomalyRatio(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
          />
        </div>
      </div>

      {/* Live Telemetry Diagnostics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-slate-400 font-semibold block">Total Requests Sent</span>
          <span className="text-lg font-extrabold text-white font-mono">{stats.sentCount}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Anomalies Detected</span>
          <span className="text-lg font-extrabold text-amber-400 font-mono">{stats.anomaliesCount}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Webhooks Dispatched</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono">{stats.webhooksDispatched}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">SignalR Connected Clients</span>
          <span className="text-lg font-extrabold text-blue-400 font-mono">3 (Web, iOS, Android)</span>
        </div>
      </div>
    </div>
  );
};
