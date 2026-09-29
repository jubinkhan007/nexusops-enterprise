import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, UserCheck, RefreshCw, Send, FileText, Activity, Radio, PhoneCall } from 'lucide-react';

interface Incident {
  incidentId: string;
  title: string;
  severity: 'P1-CRITICAL' | 'P2-MAJOR' | 'P3-MINOR';
  service: string;
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  onCallEngineer: string;
  escalationTier: string;
  triggeredAt: string;
}

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      incidentId: 'INC-94821',
      title: 'PostgreSQL Replica Node Latency Spike (High Replication Lag)',
      severity: 'P1-CRITICAL',
      service: 'database-cluster-us-east-1',
      status: 'TRIGGERED',
      onCallEngineer: 'Alex Mercer (SRE Primary)',
      escalationTier: 'Tier 1 SRE',
      triggeredAt: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      incidentId: 'INC-94820',
      title: 'Redis Cache Memory Saturation (Eviction Threshold 90%)',
      severity: 'P2-MAJOR',
      service: 'cache-redis-cluster',
      status: 'ACKNOWLEDGED',
      onCallEngineer: 'Sarah Jenkins (SRE Secondary)',
      escalationTier: 'Tier 2 Infra',
      triggeredAt: new Date(Date.now() - 45 * 60000).toISOString()
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPostMortem, setSelectedPostMortem] = useState<string | null>('INC-94821');

  const [escalationLogs, setEscalationLogs] = useState<string[]>([
    '[PAGERDUTY ENGINE] On-call escalation policy active (Tier 1 -> Tier 2 -> Executive).',
    '[SLACK BOT] Channel #incident-p1-war-room bridged to Opsgenie alert stream.',
    '[AI RCA] Machine Learning root cause analyzer standing by.'
  ]);

  const handleTriggerSyntheticP1 = () => {
    setIsProcessing(true);
    const newId = 'INC-' + Math.floor(10000 + Math.random() * 90000);
    setEscalationLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚨 SYNTHETIC P1 INCIDENT TRIGGERED: ${newId} (Kafka Broker Disk Pressure)`,
      `[${new Date().toLocaleTimeString()}] 📟 Firing PagerDuty v2 API Enqueue Event for Alex Mercer...`,
      `[${new Date().toLocaleTimeString()}] 💬 Dispatching alert payload to Slack #incident-p1-war-room...`
    ]);

    setTimeout(() => {
      setIncidents(prev => [
        {
          incidentId: newId,
          title: 'Kafka Cluster Disk Pressure (Partition Repending)',
          severity: 'P1-CRITICAL',
          service: 'kafka-messaging-core',
          status: 'TRIGGERED',
          onCallEngineer: 'Alex Mercer (SRE Primary)',
          escalationTier: 'Tier 1 SRE',
          triggeredAt: new Date().toISOString()
        },
        ...prev
      ]);
      setSelectedPostMortem(newId);
      setIsProcessing(false);
    }, 2000);
  };

  const handleAcknowledge = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.incidentId === id ? { ...inc, status: 'ACKNOWLEDGED' } : inc));
    setEscalationLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 👤 Incident ${id} ACKNOWLEDGED by Alex Mercer. PagerDuty escalation timer paused.`
    ]);
  };

  const handleResolve = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.incidentId === id ? { ...inc, status: 'RESOLVED' } : inc));
    setEscalationLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ✅ Incident ${id} RESOLVED! PagerDuty incident closed. AI Post-Mortem draft finalized.`
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>Enterprise Incident War Room | NexusOps Enterprise</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-rose-600 to-amber-600 rounded-xl shadow-lg shadow-rose-500/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Enterprise Incident Management & PagerDuty War Room
              </h1>
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>On-Call Escalation Active</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Automated PagerDuty/Opsgenie escalation webhooks, AI-assisted root cause analysis (RCA), and Slack war room dispatching.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleTriggerSyntheticP1}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Firing PagerDuty Alert...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Trigger P1 Incident Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Incident Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active P1 Incidents</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">
              {incidents.filter(i => i.severity === 'P1-CRITICAL' && i.status !== 'RESOLVED').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Requiring immediate SRE intervention</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mean Time to Resolve (MTTR)</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              8.5 <span className="text-xs font-sans font-normal">min</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">SLA Target: &lt; 15.0 min</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Primary On-Call Lead</span>
              <UserCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white mt-2 truncate">
              Alex Mercer
            </div>
            <div className="text-xs text-indigo-400 mt-1">SRE Tier 1 Primary Rotation</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">War Room Channel</span>
              <Send className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-sky-300 mt-2 font-mono truncate">
              #incident-p1-war-room
            </div>
            <div className="text-xs text-slate-500 mt-1">Slack & Microsoft Teams Bridged</div>
          </div>
        </div>

        {/* Active Incidents & Post-Mortem Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Active Incidents Table */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Active Incident Triage Stream</span>
            </h2>

            <div className="space-y-4">
              {incidents.map(inc => (
                <div
                  key={inc.incidentId}
                  onClick={() => setSelectedPostMortem(inc.incidentId)}
                  className={`p-4 bg-slate-950/60 border rounded-xl transition cursor-pointer ${
                    selectedPostMortem === inc.incidentId ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        inc.severity === 'P1-CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-bold">{inc.incidentId}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {inc.status === 'TRIGGERED' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAcknowledge(inc.incidentId); }}
                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition"
                        >
                          Acknowledge
                        </button>
                      )}
                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResolve(inc.incidentId); }}
                          className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition"
                        >
                          Resolve
                        </button>
                      )}
                      {inc.status === 'RESOLVED' && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold font-mono">
                          RESOLVED
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-2">{inc.title}</h3>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-900">
                    <div>Service: <span className="text-slate-200 font-semibold">{inc.service}</span></div>
                    <div>On-Call: <span className="text-indigo-300">{inc.onCallEngineer}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Post-Mortem Report Viewer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>AI Root Cause Post-Mortem</span>
            </h2>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs font-mono space-y-3">
              <div>
                <span className="text-slate-500 block mb-1">INCIDENT RECORD:</span>
                <span className="text-rose-400 font-bold">{selectedPostMortem} - PostgreSQL Replica Node Latency Spike</span>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-400 font-bold block mb-1">ROOT CAUSE ANALYSIS (RCA):</span>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  High-throughput batch vector ingestion query saturated shared_buffers pool, causing WAL sender queue replay lag to spike above 450ms.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-400 font-bold block mb-1">PREVENTATIVE ACTION ITEMS:</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>Tune VPA memory limits for database-writer pods.</li>
                  <li>Increase shared_buffers to 8GB in postgresql.conf.</li>
                  <li>Add alert trigger for wal_sender_queue &gt; 50MB.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Post-Mortem Status:</span>
                <span className="text-emerald-400 font-bold">APPROVED & ARCHIVED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Escalation Console Log */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <span>PagerDuty & Slack Escalation Stream</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Escalation Policy: <span className="text-rose-400 font-bold">Tier 1 SRE Primary</span>
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
            {escalationLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log.includes('RESOLVED') || log.includes('PASSED') ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : log.includes('P1') || log.includes('TRIGGERED') ? (
                  <span className="text-rose-400 font-bold">{log}</span>
                ) : log.includes('ACKNOWLEDGED') || log.includes('Slack') ? (
                  <span className="text-amber-400">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
