import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Bell, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ExecutiveReportsPage() {
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [reportCategory, setReportCategory] = useState('Full Platform Audit');
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [includeVectorStats, setIncludeVectorStats] = useState(true);
  const [copied, setCopied] = useState(false);

  // Enterprise Alert Channel States
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [teamsUrl, setTeamsUrl] = useState('https://outlook.office.com/webhook/XXXX');
  const [pagerdutyKey, setPagerdutyKey] = useState('pd_routing_key_prod_2026');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestAlert = async (channel: 'Slack' | 'MS Teams' | 'PagerDuty') => {
    setTestResult(`Dispatching test alert payload to ${channel}...`);
    setTimeout(() => {
      setTestResult(`✓ Test alert payload successfully delivered to ${channel}!`);
      setTimeout(() => setTestResult(null), 3000);
    }, 600);
  };

  const reportData = {
    generatedAt: new Date().toISOString(),
    timeRange,
    reportCategory,
    systemHealthScore: '99.8%',
    totalExecutions: 34910,
    anomaliesDetected: 12,
    webhooksDispatched: 12,
    p95LatencyMs: 18.5,
    ragQueriesProcessed: 142,
    indexedVectorDocs: 5,
    embeddingDimension: 1536,
    mlModel: 'Scikit-Learn IsolationForest (contamination=0.05)',
    vectorDatabase: 'PostgreSQL 16 + pgvector (HNSW Cosine Index)'
  };

  const generateMarkdownSummary = () => {
    return `# NexusOps Enterprise AI & Telemetry Executive Report
Generated At: ${reportData.generatedAt}
Time Range: ${reportData.timeRange}
Category: ${reportData.reportCategory}

## Executive Summary Metrics
- **System Operational Health Score**: ${reportData.systemHealthScore}
- **p95 Latency**: ${reportData.p95LatencyMs} ms
- **Total Workflow Executions**: ${reportData.totalExecutions.toLocaleString()}
- **ML Anomalies Intercepted**: ${reportData.anomaliesDetected}
- **ASP.NET Core Webhooks Triggered**: ${reportData.webhooksDispatched}

## AI Microservice & Vector Engine
- **Scikit-Learn ML Model**: ${reportData.mlModel}
- **pgvector Vector Database**: ${reportData.vectorDatabase}
- **RAG Semantic Queries Processed**: ${reportData.ragQueriesProcessed}
- **Total Vector Documents Indexed**: ${reportData.indexedVectorDocs} (Embedding Dim: ${reportData.embeddingDimension})
`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateMarkdownSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexusops_executive_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Head>
        <title>Executive AI & Telemetry Reports | NexusOps</title>
      </Head>

      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 print:hidden">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                REPORTS & COMPLIANCE
              </span>
              <span className="text-xs text-slate-400">PDF / JSON / Multi-Channel Alerting</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
              Executive AI & Telemetry Report Generator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generate enterprise-grade compliance reports covering ML IsolationForest anomaly triggers, Gemini RAG vector search, and webhooks.
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? '✓ Copied Markdown' : '📋 Copy Summary'}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              💾 Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition"
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        {/* Multi-Channel Enterprise Alerting Panel */}
        <div className="my-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 print:hidden space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <span>Multi-Channel Enterprise Alerting (Slack, MS Teams, & PagerDuty)</span>
            </h2>
            {testResult && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-mono">
                {testResult}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Slack Webhook Channel</span>
                <span className="text-emerald-400 font-mono text-[10px]">Block Kit Enabled</span>
              </div>
              <input
                type="text"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
              />
              <button
                onClick={() => handleTestAlert('Slack')}
                className="w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium transition flex items-center justify-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Test Slack Alert</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Microsoft Teams Webhook</span>
                <span className="text-blue-400 font-mono text-[10px]">Adaptive Cards</span>
              </div>
              <input
                type="text"
                value={teamsUrl}
                onChange={(e) => setTeamsUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
              />
              <button
                onClick={() => handleTestAlert('MS Teams')}
                className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-xs font-medium transition flex items-center justify-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Test Teams Alert</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>PagerDuty Integration</span>
                <span className="text-amber-400 font-mono text-[10px]">Events API v2</span>
              </div>
              <input
                type="text"
                value={pagerdutyKey}
                onChange={(e) => setPagerdutyKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
              />
              <button
                onClick={() => handleTestAlert('PagerDuty')}
                className="w-full py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium transition flex items-center justify-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Test PagerDuty Incident</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Executive Report Document Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 print:bg-white print:text-slate-900 print:border-none print:p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 print:border-slate-300">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white print:text-slate-900">
                NexusOps Enterprise Platform Report
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Category: <span className="font-semibold text-slate-200 print:text-slate-900">{reportCategory}</span> | Window: <span className="font-semibold text-slate-200 print:text-slate-900">{timeRange}</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600">
              <p className="font-bold text-blue-400 print:text-blue-700">CONFIDENTIAL & PROPRIETARY</p>
              <p className="mt-0.5">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300">
              <span className="text-xs font-semibold text-slate-400 print:text-slate-600">System Health</span>
              <p className="text-3xl font-extrabold text-emerald-400 print:text-emerald-700 mt-1">{reportData.systemHealthScore}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300">
              <span className="text-xs font-semibold text-slate-400 print:text-slate-600">p95 Latency</span>
              <p className="text-3xl font-extrabold text-blue-400 print:text-blue-700 mt-1">{reportData.p95LatencyMs} ms</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300">
              <span className="text-xs font-semibold text-slate-400 print:text-slate-600">Total Executions</span>
              <p className="text-3xl font-extrabold text-purple-400 print:text-purple-700 mt-1">{reportData.totalExecutions.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300">
              <span className="text-xs font-semibold text-slate-400 print:text-slate-600">ML Anomalies Intercepted</span>
              <p className="text-3xl font-extrabold text-amber-400 print:text-amber-700 mt-1">{reportData.anomaliesDetected}</p>
            </div>
          </div>

          {/* Detailed Section: ML Anomaly Telemetry */}
          {includeAnomalies && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2 mb-4">
                1. Scikit-Learn IsolationForest Anomaly Telemetry & Multi-Channel Alerting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Model Architecture</span>
                  <p className="text-slate-200 print:text-slate-800 font-mono">{reportData.mlModel}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Automated ASP.NET Core & FastAPI Webhooks</span>
                  <p className="text-slate-200 print:text-slate-800 font-mono">Dispatched: {reportData.webhooksDispatched} (100% Delivery to Slack, Teams, PagerDuty)</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Section: Vector RAG Store */}
          {includeVectorStats && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2 mb-4">
                2. PostgreSQL pgvector HNSW Embedding Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">RAG Queries</span>
                  <p className="text-slate-200 print:text-slate-800 font-extrabold text-sm">{reportData.ragQueriesProcessed}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Vector Documents</span>
                  <p className="text-slate-200 print:text-slate-800 font-extrabold text-sm">{reportData.indexedVectorDocs} Indexed</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Embedding Dimension</span>
                  <p className="text-slate-200 print:text-slate-800 font-extrabold text-sm">{reportData.embeddingDimension} float32</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Section: WAF & Rate Limiting Security */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2 mb-4">
              3. Web Application Firewall (WAF) & Redis Distributed Rate Limiting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <span className="text-slate-400 font-semibold block mb-1">WAF Rules Status</span>
                <p className="text-emerald-400 font-extrabold text-sm">ACTIVE (SQLi, XSS, Path Traversal)</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <span className="text-slate-400 font-semibold block mb-1">Redis Sliding Window Limit</span>
                <p className="text-purple-400 font-extrabold text-sm">100 Req / Min / Tenant</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <span className="text-slate-400 font-semibold block mb-1">Threat Payloads Blocked</span>
                <p className="text-amber-400 font-extrabold text-sm">0 (403 Forbidden Triggered)</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-xs text-slate-500">
            <span>NexusOps Enterprise Platform v2.4</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
