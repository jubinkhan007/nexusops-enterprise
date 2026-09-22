import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Activity, Gauge, Server, Terminal, ShieldCheck, Cpu, Database, Radio, RefreshCw } from 'lucide-react';

export default function TelemetryPage() {
  const [metricsText, setMetricsText] = useState(`# HELP nexus_workflow_executions_total Total number of workflow executions
# TYPE nexus_workflow_executions_total counter
nexus_workflow_executions_total 24890

# HELP nexus_ml_anomalies_detected_total Total number of ML anomalies detected
# TYPE nexus_ml_anomalies_detected_total counter
nexus_ml_anomalies_detected_total 12

# HELP nexus_vector_rag_queries_total Total RAG semantic queries processed
# TYPE nexus_vector_rag_queries_total counter
nexus_vector_rag_queries_total 142

# HELP nexus_vector_documents_indexed Total documents indexed in pgvector store
# TYPE nexus_vector_documents_indexed gauge
nexus_vector_documents_indexed 4

# HELP nexus_api_latency_seconds_p95 95th percentile API latency
# TYPE nexus_api_latency_seconds_p95 gauge
nexus_api_latency_seconds_p95 0.0425

# HELP nexus_system_health_score System operational health percentage
# TYPE nexus_system_health_score gauge
nexus_system_health_score 99.4`);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>OpenTelemetry & Grafana Inspector</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>Prometheus v2.45</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time system metric gauges across .NET Core, FastAPI ML, PostgreSQL, and RabbitMQ.</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-sm font-medium transition flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Scrape /metrics</span>
          </button>
        </div>

        {/* Telemetry Target Scrape Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>ASP.NET Core API Target</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">UP (100%)</div>
            <div className="text-blue-400 text-xs mt-2 font-mono">http://backend-dotnet:5000</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>FastAPI AI Engine Target</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">UP (100%)</div>
            <div className="text-indigo-400 text-xs mt-2 font-mono">http://backend-ai-fastapi:8000</div>
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
              <span>Prometheus Scrape Status</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">15s Interval</div>
            <div className="text-slate-400 text-xs mt-2 font-mono">http://localhost:9090</div>
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
                  <span className="text-blue-400 font-bold">42.5ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">p99 (99th Percentile Spike)</span>
                  <span className="text-amber-400 font-bold">89.2ms</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>OpenTelemetry Exporter</span>
              <span className="font-mono text-emerald-400 font-medium">99.4% SLA</span>
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
