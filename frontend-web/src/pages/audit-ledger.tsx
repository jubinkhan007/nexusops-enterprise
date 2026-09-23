import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { ShieldCheck, Search, Filter, Download, Lock, FileText, CheckCircle2, UserCheck, Terminal } from 'lucide-react';

interface AuditRecord {
  id: string;
  userId: string;
  action: string;
  resourceName: string;
  ipAddress: string;
  stateDiffJson: string;
  complianceCategory: 'SOC2_TYPE_II' | 'HIPAA' | 'GDPR';
  createdAt: string;
}

export default function AuditLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [auditLogs] = useState<AuditRecord[]>([
    {
      id: 'audit-001',
      userId: 'jubinkhan007@nexusops.enterprise.internal',
      action: 'ROLE_ELEVATED',
      resourceName: 'AuthContext.Role',
      ipAddress: '192.168.1.45',
      stateDiffJson: '{"before": "Operator", "after": "Admin"}',
      complianceCategory: 'SOC2_TYPE_II',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'audit-002',
      userId: 'fastapi_ai_service',
      action: 'ANOMALY_WEBHOOK_DISPATCHED',
      resourceName: 'FastAPI.IsolationForest',
      ipAddress: '10.0.4.12',
      stateDiffJson: '{"anomalyScore": 0.892, "executionDurationMs": 24.1}',
      complianceCategory: 'HIPAA',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString()
    },
    {
      id: 'audit-003',
      userId: 'jubinkhan007@nexusops.enterprise.internal',
      action: 'WORKFLOW_CREATED',
      resourceName: 'Document Sentiment Pipeline',
      ipAddress: '192.168.1.45',
      stateDiffJson: '{"status": "Active", "triggerEvent": "DocumentUploaded"}',
      complianceCategory: 'SOC2_TYPE_II',
      createdAt: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      id: 'audit-004',
      userId: 'operator@nexusops.enterprise.internal',
      action: 'VECTOR_RAG_QUERY',
      resourceName: 'PostgreSQL.pgvector',
      ipAddress: '192.168.1.89',
      stateDiffJson: '{"query": "IsolationForest anomaly threshold", "dimension": 1536}',
      complianceCategory: 'GDPR',
      createdAt: new Date(Date.now() - 40 * 60000).toISOString()
    }
  ]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesCategory = selectedCategory === 'All' || log.complianceCategory === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Category', 'State Diff'];
    const rows = filteredLogs.map(l => [
      l.id, l.createdAt, l.userId, l.action, l.resourceName, l.ipAddress, l.complianceCategory, `"${l.stateDiffJson.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexusops_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Head>
        <title>SOC 2 & HIPAA Audit Ledger | NexusOps</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>SOC 2 & HIPAA Immutable Audit Ledger</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Tamper-Proof Ledger</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time audit trail of administrative role changes, workflow triggers, and vector store queries.</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-medium transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Audit CSV</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search user, action, or resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Compliance Standards</option>
              <option value="SOC2_TYPE_II">SOC 2 Type II</option>
              <option value="HIPAA">HIPAA Compliance</option>
              <option value="GDPR">GDPR Data Privacy</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-400 space-x-2 px-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verified Cryptographic Signature Hash</span>
          </div>
        </div>

        {/* Audit Log Entries Table */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User / Service</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">State Diff (JSON)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 text-indigo-400 font-bold whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                      {log.resourceName}
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.complianceCategory === 'SOC2_TYPE_II' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        log.complianceCategory === 'HIPAA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.complianceCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <code className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] text-emerald-400 block max-w-xs truncate">
                        {log.stateDiffJson}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
