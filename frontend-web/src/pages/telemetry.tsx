import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Activity, Gauge, Server, Terminal, ShieldCheck, Cpu, Database, Radio, RefreshCw, BarChart2, GitCommit, Layers } from 'lucide-react';

export default function TelemetryPage() {
  const [metricsText, setMetricsText] = useState(`# HELP nexus_workflow_executions_total Total number of workflow executions
# TYPE nexus_workflow_executions_total counter
nexus_workflow_executions_total 34910

# HELP nexus_ml_anomalies_detected_total Total number of ML anomalies detected
# TYPE nexus_ml_anomalies_detected_total counter
nexus_ml_anomalies_detected_total 12

# HELP nexus_vector_rag_queries_total Total RAG semantic queries processed
# TYPE nexus_vector_rag_queries_total counter
nexus_vector_rag_queries_total 142

# HELP nexus_signalr_active_connections Active WebSocket connections on SignalR hub
# TYPE nexus_signalr_active_connections gauge
nexus_signalr_active_connections 14

# HELP nexus_api_latency_seconds_p95 95th percentile API latency
# TYPE nexus_api_latency_seconds_p95 gauge
nexus_api_latency_seconds_p95 0.0185

# HELP nexus_system_health_score System operational health percentage
# TYPE nexus_system_health_score gauge
nexus_system_health_score 99.8`);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const activeSpans = [
    { spanId: "span-a8f102", service: "Next.js Frontend", operation: "POST /api/workflows/trigger", durationMs: 14.2, status: "OK 200" },
    { spanId: "span-b9e203", service: "ASP.NET Core API", operation: "WorkflowsController.TriggerWorkflow", durationMs: 18.5, status: "OK 200" },
    { spanId: "span-c0f304", service: "FastAPI AI Engine", operation: "AnomalyDetector.predict_anomaly", durationMs: 24.1, status: "OK 200" },
    { spanId: "span-d1a405", service: "PostgreSQL pgvector", operation: "SELECT HNSW_COSINE_SIMILARITY", durationMs: 4.8, status: "OK 200" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>OpenTelemetry & Grafana Inspector</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>Prometheus & Grafana v10.2</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time system metric gauges and distributed W3C OpenTelemetry trace context propagation.</p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-sm font-medium transition flex items-center space-x-2"
            >
              <BarChart2 className="w-4 h-4 text-orange-400" />
              <span>Open Grafana Dashboard</span>
            </a>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-sm font-medium transition flex items-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Scrape /metrics</span>
            </button>
          </div>
        </div>

        {/* Telemetry Target Scrape Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>ASP.NET Core API Target</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">UP (100%)</div>
            <div className="text-blue-400 text-xs mt-2 font-mono">http://backend-dotnet:5000/metrics</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>FastAPI AI Engine Target</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">UP (100%)</div>
            <div className="text-indigo-400 text-xs mt-2 font-mono">http://backend-ai-fastapi:8000/metrics</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>PostgreSQL pgvector</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">1.2ms Latency</div>
            <div className="text-emerald-400/80 text-xs mt-2 font-mono">HNSW Cosine Vector Index</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Grafana Dashboard</span>
              <BarChart2 className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400 mt-2">Port 3001</div>
            <div className="text-slate-400 text-xs mt-2 font-mono">http://localhost:3001</div>
          </div>
        </div>

        {/* Distributed Trace Timeline */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>OpenTelemetry Distributed Trace Context (`traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-...`)</span>
          </h2>

          <div className="space-y-3">
            {activeSpans.map((span, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex items-center space-x-3">
                  <GitCommit className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-mono text-slate-400 mr-2">[{span.spanId}]</span>
                    <span className="text-sm font-semibold text-white mr-3">{span.service}</span>
                    <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{span.operation}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{span.durationMs} ms</span>
                  <span className="text-xs font-mono text-indigo-400">{span.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* System Latency Histograms Card */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>API Latency Percentiles (ms)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">p50 (Median Latency)</span>
                  <span className="text-emerald-400 font-bold">12.4ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">p95 (95th Percentile)</span>
                  <span className="text-blue-400 font-bold">18.5ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">p99 (99th Percentile Spike)</span>
                  <span className="text-amber-400 font-bold">42.1ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>OpenTelemetry Exporter</span>
              <span className="font-mono text-emerald-400 font-medium">99.8% SLA</span>
            </div>
          </div>

          {/* Prometheus OpenTelemetry Metric Stream Viewer */}
          <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Prometheus OpenTelemetry Stream (/metrics)</span>
              </h2>
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs font-mono">
                text/plain; version=0.0.4
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 flex-1 overflow-y-auto space-y-2 border border-slate-800/80 max-h-[300px]">
              <pre className="leading-relaxed whitespace-pre-wrap text-emerald-400/90">{metricsText}</pre>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
