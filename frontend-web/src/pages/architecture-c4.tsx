import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Layers, Server, Shield, Cloud, Terminal, Cpu, Database, Network } from 'lucide-react';

export default function ArchitectureC4Page() {
  const [activeTab, setActiveTab] = useState<'C1' | 'C2' | 'C3' | 'C4' | 'Runbook'>('C1');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Head>
        <title>C4 Architecture Portfolio | NexusOps Enterprise</title>
      </Head>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <Layers className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">C4 Architecture Portfolio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Architectural Blueprints, Container Topology, Microservice Pipelines, AWS EKS Deployment, and Operator Runbook
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-2xl">
          {(['C1', 'C2', 'C3', 'C4', 'Runbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab === 'C1' && 'C1: System Context'}
              {tab === 'C2' && 'C2: Containers'}
              {tab === 'C3' && 'C3: Components'}
              {tab === 'C4' && 'C4: Deployment'}
              {tab === 'Runbook' && 'Runbook & SLAs'}
            </button>
          ))}
        </div>

        {/* C1: System Context */}
        {activeTab === 'C1' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <span>C1: System Context Overview</span>
              </h2>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                NexusOps Enterprise acts as the central AI-driven operations and workflow automation hub. It orchestrates real-time events, monitors microservice health, enforces SOC 2 / HIPAA compliance audit ledgers, and integrates with enterprise alert dispatchers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-cyan-400 block mb-1">Human Actors</span>
                  <p className="text-slate-300">DevOps Engineers, SREs, SOC 2 Auditors, and Enterprise Operators using Web & Mobile apps.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-purple-400 block mb-1">Multi-Tenant Core</span>
                  <p className="text-slate-300">ASP.NET Core API Gateway, FastAPI AI Engine, and PostgreSQL Row-Level Security data isolation.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">External Integrations</span>
                  <p className="text-slate-300">Slack Block Kit Webhooks, MS Teams Adaptive Cards, PagerDuty v2, AWS S3 Encrypted Storage.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C2: Containers */}
        {activeTab === 'C2' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                <Server className="w-5 h-5 text-purple-400" />
                <span>C2: Container Topology</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mt-6">
                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>ASP.NET Core 8 API</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">C# API Gateway handling JWT RBAC, SignalR WebSocket notifications, GraphQL schema, and EF Core RLS.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>FastAPI AI Service</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Python 3.11 service running Scikit-Learn IsolationForest anomaly detection and Gemini pgvector RAG embeddings.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
                    <Database className="w-4 h-4" />
                    <span>PostgreSQL 16 + pgvector</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Primary relational and vector store with Row-Level Security policies and HNSW cosine vector index.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
                    <Shield className="w-4 h-4" />
                    <span>WAF & Rate Limiter</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Redis-backed sliding window rate limiter (100 req/min) and regex WAF payload security inspector.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-pink-400 font-bold mb-2">
                    <Terminal className="w-4 h-4" />
                    <span>Backup Cron Sidecar</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Alpine container executing scheduled `pg_dump`, AES-256 OpenSSL encryption, SHA-256 checksums, and S3 sync.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold mb-2">
                    <Cloud className="w-4 h-4" />
                    <span>Prometheus & Grafana</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Full-stack observability stack scraping OpenTelemetry metrics and W3C traceparent spans.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C3: Components */}
        {activeTab === 'C3' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>C3: Microservice Component Pipelines</span>
              </h2>
              <div className="space-y-4 text-xs mt-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-indigo-400 block mb-1">ASP.NET Core Execution Pipeline</span>
                  <p className="text-slate-300 font-mono">
                    HTTP Request → WafSecurityMiddleware → RateLimitingMiddleware → TenantContext Injector → JWT Auth → GraphQL / Controller Resolvers → Audit Log Ledger
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-purple-400 block mb-1">FastAPI AI Execution Pipeline</span>
                  <p className="text-slate-300 font-mono">
                    AI Request → WafAndRateLimitMiddleware → IsolationForest Anomaly Model → Gemini RAG Engine → Multi-Channel Alert Dispatcher
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C4: Deployment */}
        {activeTab === 'C4' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                <span>C4: AWS EKS & Kubernetes Infrastructure</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-blue-400 block mb-1">EKS Kubernetes Pods</span>
                  <p className="text-slate-300">`backend-dotnet` (Replica: 2, HPA max 10), `backend-ai-fastapi` (Replica: 2, HPA max 8), `frontend-web` (Replica: 2).</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">Storage & PVCs</span>
                  <p className="text-slate-300">AWS RDS PostgreSQL 16 Multi-AZ, 50GB `postgres-backup-pvc`, and `backup_data` volumes.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">Networking & Security</span>
                  <p className="text-slate-300">VPC Private Subnets, NGINX Ingress Controller, TLS 1.3 termination, and TLS/SSL cert manager.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Runbook & SLAs */}
        {activeTab === 'Runbook' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Enterprise Operator Runbook & SLAs</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs my-6">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Target Availability</span>
                  <p className="text-emerald-400 font-extrabold text-lg">99.99% HA</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Recovery Point (RPO)</span>
                  <p className="text-blue-400 font-extrabold text-lg">&lt; 5 Minutes</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Recovery Time (RTO)</span>
                  <p className="text-purple-400 font-extrabold text-lg">&lt; 2000 ms</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Rate Limit Threshold</span>
                  <p className="text-amber-400 font-extrabold text-lg">100 Req / Min</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                <span className="text-slate-400 block font-bold font-sans">Emergency Disaster Recovery Commands:</span>
                <p className="text-emerald-400"># 1. Execute On-Demand AES-256 Encrypted Database Backup</p>
                <p className="text-slate-300">./devops/scripts/backup_restore.sh backup</p>
                <p className="text-emerald-400 mt-2"># 2. Execute Full Chaos Engineering Resilience Assessment</p>
                <p className="text-slate-300">./devops/scripts/chaos_runner.sh full-assessment</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
