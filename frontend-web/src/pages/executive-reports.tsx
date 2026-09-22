import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';

export default function ExecutiveReportsPage() {
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [reportCategory, setReportCategory] = useState('Full Platform Audit');
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [includeVectorStats, setIncludeVectorStats] = useState(true);
  const [copied, setCopied] = useState(false);

  const reportData = {
    generatedAt: new Date().toISOString(),
    timeRange,
    reportCategory,
    systemHealthScore: '99.4%',
    totalExecutions: 24890,
    anomaliesDetected: 12,
    webhooksDispatched: 12,
    p95LatencyMs: 11.5,
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
              <span className="text-xs text-slate-400">PDF / JSON / Markdown Exporter</span>
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

        {/* Configuration Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:hidden">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Time Window</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Quarter to Date</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Report Category</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option>Full Platform Audit</option>
              <option>AI Anomaly & Security Audit</option>
              <option>Vector RAG Store Performance</option>
              <option>SignalR & Webhook Reliability</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-5">
            <input
              type="checkbox"
              id="includeAnomalies"
              checked={includeAnomalies}
              onChange={(e) => setIncludeAnomalies(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="includeAnomalies" className="text-xs text-slate-300 font-medium cursor-pointer">
              Include ML Anomaly Telemetry
            </label>
          </div>

          <div className="flex items-center space-x-2 pt-5">
            <input
              type="checkbox"
              id="includeVectorStats"
              checked={includeVectorStats}
              onChange={(e) => setIncludeVectorStats(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="includeVectorStats" className="text-xs text-slate-300 font-medium cursor-pointer">
              Include pgvector HNSW Metrics
            </label>
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
                1. Scikit-Learn IsolationForest Anomaly Telemetry
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Model Architecture</span>
                  <p className="text-slate-200 print:text-slate-800 font-mono">{reportData.mlModel}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600 font-semibold block mb-1">Automated ASP.NET Core Webhooks</span>
                  <p className="text-slate-200 print:text-slate-800 font-mono">Dispatched: {reportData.webhooksDispatched} (100% Success Delivery Rate)</p>
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

          <div className="mt-8 pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-xs text-slate-500">
            <span>NexusOps Enterprise Platform v2.4</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
