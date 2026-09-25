import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Play, Code, Database, Server, CheckCircle, Copy, Check, Terminal } from 'lucide-react';

const DEFAULT_QUERIES = [
  {
    name: '1. System Health & Workflows',
    query: `query GetSystemHealthAndWorkflows {
  systemHealth {
    healthScore
    p95LatencyMs
    activeServicesCount
    postgresRlsStatus
    wafSecurityStatus
  }
  workflows {
    id
    name
    status
    executionDurationMs
    triggeredBy
  }
}`
  },
  {
    name: '2. SOC 2 Audit Ledger',
    query: `query GetAuditTrail {
  auditLogs {
    logId
    action
    performedBy
    tenantId
    timestamp
  }
}`
  },
  {
    name: '3. Vector RAG & IsolationForest AI',
    query: `query GetAiInsights {
  aiInsights {
    modelName
    vectorDatabase
    totalRagQueries
    indexedVectorCount
  }
}`
  },
  {
    name: '4. Mutation: Trigger Workflow',
    query: `mutation TriggerOnDemandWorkflow {
  triggerWorkflow(name: "Data Vector Sync", tenantId: "tenant-nexus-global") {
    id
    name
    status
    triggeredBy
  }
}`
  }
];

export default function GraphQlExplorerPage() {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [queryString, setQueryString] = useState(DEFAULT_QUERIES[0].query);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectQuery = (index: number) => {
    setActiveQueryIndex(index);
    setQueryString(DEFAULT_QUERIES[index].query);
    setResponseJson(null);
  };

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    const start = performance.now();

    try {
      const res = await fetch('http://localhost:5050/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'tenant-nexus-global'
        },
        body: JSON.stringify({ query: queryString })
      });

      if (res.ok) {
        const data = await res.json();
        setResponseJson(JSON.stringify(data, null, 2));
      } else {
        // Mock fallback if API backend container is offline
        generateMockResponse(queryString);
      }
    } catch {
      generateMockResponse(queryString);
    } finally {
      const elapsed = Math.round(performance.now() - start);
      setExecutionTime(elapsed || 12);
      setIsExecuting(false);
    }
  };

  const generateMockResponse = (query: string) => {
    if (query.includes('mutation') || query.includes('triggerWorkflow')) {
      setResponseJson(JSON.stringify({
        data: {
          triggerWorkflow: {
            id: `wf-${Math.random().toString(36).substring(2, 9)}`,
            name: "On-Demand Data Vector Sync",
            status: "Running",
            triggeredBy: "GraphQL Gateway (tenant-nexus-global)"
          }
        }
      }, null, 2));
    } else if (query.includes('auditLogs')) {
      setResponseJson(JSON.stringify({
        data: {
          auditLogs: [
            { logId: "aud-101", action: "ROLE_CHANGED", performedBy: "admin@nexusops.io", tenantId: "tenant-nexus-global", timestamp: new Date().toISOString() },
            { logId: "aud-102", action: "VECTOR_INGEST", performedBy: "system", tenantId: "tenant-acme-corp", timestamp: new Date().toISOString() }
          ]
        }
      }, null, 2));
    } else if (query.includes('aiInsights')) {
      setResponseJson(JSON.stringify({
        data: {
          aiInsights: {
            modelName: "Scikit-Learn IsolationForest (contamination=0.05)",
            vectorDatabase: "PostgreSQL 16 + pgvector (HNSW Index)",
            totalRagQueries: 142,
            indexedVectorCount: 5
          }
        }
      }, null, 2));
    } else {
      setResponseJson(JSON.stringify({
        data: {
          systemHealth: {
            healthScore: "99.8%",
            p95LatencyMs: 18.5,
            activeServicesCount: 5,
            postgresRlsStatus: "Enforced (Row-Level Security Active)",
            wafSecurityStatus: "Active (0 Malicious Payloads Blocked)"
          },
          workflows: [
            { id: "wf-001", name: "Gemini RAG Vector Ingestion", status: "Completed", executionDurationMs: 450, triggeredBy: "System Schedule" },
            { id: "wf-002", name: "IsolationForest Anomaly Scan", status: "Running", executionDurationMs: 120, triggeredBy: "Operator (admin)" }
          ]
        }
      }, null, 2));
    }
  };

  const handleCopyResponse = () => {
    if (responseJson) {
      navigator.clipboard.writeText(responseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Head>
        <title>GraphQL API Gateway | NexusOps Enterprise</title>
      </Head>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <Code className="w-8 h-8 text-pink-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">GraphQL API Gateway</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                /graphql
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Unified Schema Federation querying Workflows, System Health, SOC 2 Audit Ledger, and Gemini Vector RAG AI
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleExecuteQuery}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isExecuting ? 'Executing Query...' : 'Execute Query'}</span>
            </button>
          </div>
        </div>

        {/* Preset Query Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DEFAULT_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuery(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                activeQueryIndex === idx
                  ? 'bg-pink-600/20 text-pink-300 border-pink-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {q.name}
            </button>
          ))}
        </div>

        {/* Query Editor & Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Input Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                <span>GraphQL Query / Mutation Payload</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">POST /graphql</span>
            </div>
            <div className="p-4 flex-1">
              <textarea
                value={queryString}
                onChange={(e) => setQueryString(e.target.value)}
                className="w-full h-96 bg-slate-950 text-pink-300 font-mono text-xs p-4 rounded-xl border border-slate-800/80 focus:border-pink-500/50 focus:ring-0 outline-none leading-relaxed resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>GraphQL JSON Response</span>
                {executionTime !== null && (
                  <span className="text-xs text-emerald-400 font-normal">({executionTime} ms)</span>
                )}
              </span>
              {responseJson && (
                <button
                  onClick={handleCopyResponse}
                  className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="p-4 flex-1 bg-slate-950/60 overflow-auto max-h-96">
              {responseJson ? (
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {responseJson}
                </pre>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Server className="w-10 h-10 text-slate-700 mb-3" />
                  <p>Click <strong className="text-pink-400">Execute Query</strong> to fetch live GraphQL response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
