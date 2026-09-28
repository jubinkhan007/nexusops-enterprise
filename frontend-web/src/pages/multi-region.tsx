import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Globe, Server, ShieldCheck, RefreshCw, AlertTriangle, Activity, Database, CheckCircle2, ArrowRightLeft, Radio } from 'lucide-react';

interface RegionalNode {
  regionId: string;
  regionName: string;
  role: 'Primary Active' | 'Secondary Active' | 'Standby Replica';
  status: 'HEALTHY' | 'FAILOVER_ACTIVE' | 'DEGRADED';
  latencyMs: number;
  replicationLagMs: number;
  dnsEndpoint: string;
}

export default function MultiRegionPage() {
  const [nodes, setNodes] = useState<RegionalNode[]>([
    {
      regionId: 'us-east-1',
      regionName: 'US East (N. Virginia)',
      role: 'Primary Active',
      status: 'HEALTHY',
      latencyMs: 12.4,
      replicationLagMs: 0.0,
      dnsEndpoint: 'api-us-east-1.nexusops-enterprise.io'
    },
    {
      regionId: 'eu-west-1',
      regionName: 'EU West (Ireland)',
      role: 'Secondary Active',
      status: 'HEALTHY',
      latencyMs: 45.2,
      replicationLagMs: 18.5,
      dnsEndpoint: 'api-eu-west-1.nexusops-enterprise.io'
    },
    {
      regionId: 'ap-southeast-1',
      regionName: 'Asia Pacific (Singapore)',
      role: 'Standby Replica',
      status: 'HEALTHY',
      latencyMs: 110.8,
      replicationLagMs: 32.1,
      dnsEndpoint: 'api-ap-southeast-1.nexusops-enterprise.io'
    }
  ]);

  const [isFailingOver, setIsFailingOver] = useState(false);
  const [failoverLogs, setFailoverLogs] = useState<string[]>([
    '[TOPOLOGY] Multi-Region Active-Active Mesh operational across 3 AWS Availability Regions.',
    '[ROUTE 53] Latency-based health probes reporting 100% endpoint reachability.',
    '[POSTGRESQL] Logical replication publication nexusops_pub_us_east_1 streaming cleanly.'
  ]);

  const handleInitiateFailover = () => {
    setIsFailingOver(true);
    setFailoverLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚠️ INITIATING DISASTER RECOVERY FAILOVER TO EU-WEST-1...`,
      `[${new Date().toLocaleTimeString()}] 📡 Route 53 updating health check weighting for primary endpoint...`,
      `[${new Date().toLocaleTimeString()}] 🔄 Promoting PostgreSQL Logical Subscription nexusops_sub_eu_west_1 to Primary Leader...`,
      `[${new Date().toLocaleTimeString()}] ⚡ Re-routing regional traffic to api-eu-west-1.nexusops-enterprise.io (RTO = 1.42s).`
    ]);

    setTimeout(() => {
      setNodes(prev => prev.map(node => {
        if (node.regionId === 'eu-west-1') {
          return { ...node, role: 'Primary Active', status: 'HEALTHY', replicationLagMs: 0.0 };
        }
        if (node.regionId === 'us-east-1') {
          return { ...node, role: 'Secondary Active', status: 'HEALTHY', replicationLagMs: 14.2 };
        }
        return node;
      }));

      setFailoverLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ REGIONAL FAILOVER COMPLETED SUCCESSFULLY! EU West-1 is now Active Primary Leader.`
      ]);
      setIsFailingOver(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>Multi-Region Active-Active Topology | NexusOps Enterprise</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Multi-Region Active-Active Cloud DNS & Replication
              </h1>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RPO &lt; 1s | RTO &lt; 5s</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              AWS Route 53 latency-based routing with dual-primary PostgreSQL logical replication publication & subscription stream topology.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleInitiateFailover}
              disabled={isFailingOver}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isFailingOver ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Failover Switchover...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Simulate Regional Failover</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SLA Telemetry Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Recovery Point Objective (RPO)</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              0.02 <span className="text-xs font-sans font-normal">sec</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Target SLA: &lt; 1.0 s (Zero Data Loss)</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Recovery Time Objective (RTO)</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-400 mt-2 font-mono">
              1.42 <span className="text-xs font-sans font-normal">sec</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Target SLA: &lt; 5.0 s (Automatic Switchover)</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Route 53 DNS Routing</span>
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-extrabold text-white mt-2">
              Latency-Based
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Health Probes Active (10s)</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">PostgreSQL Replication</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-extrabold text-white mt-2">
              Logical Stream
            </div>
            <div className="text-xs text-slate-500 mt-1">Slot: nexusops_sub_eu_west_1</div>
          </div>
        </div>

        {/* Regional Topology Node Cards */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Server className="w-5 h-5 text-cyan-400" />
          <span>Active Global Region Nodes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {nodes.map(node => (
            <div
              key={node.regionId}
              className={`bg-slate-900/60 border rounded-2xl p-6 backdrop-blur shadow-xl transition relative overflow-hidden ${
                node.role.includes('Primary')
                  ? 'border-cyan-500/50 shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {node.role.includes('Primary') && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                  Primary Leader
                </div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-cyan-400">
                  {node.regionId.split('-')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{node.regionName}</h3>
                  <span className="text-xs font-mono text-slate-400">{node.regionId}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Node Role:</span>
                  <span className={`font-semibold ${node.role.includes('Primary') ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {node.role}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Network Latency:</span>
                  <span className="text-slate-200 font-bold">{node.latencyMs} ms</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Replication Lag:</span>
                  <span className={`font-bold ${node.replicationLagMs === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {node.replicationLagMs} ms
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">DNS Endpoint:</span>
                  <span className="text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded-lg block truncate border border-slate-800/60">
                    {node.dnsEndpoint}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Failover Console Log */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Multi-Region Replication & Failover Telemetry Log</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Sync Mode: <span className="text-emerald-400 font-bold">Synchronous WAL Stream</span>
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
            {failoverLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log.includes('FAILOVER') || log.includes('INITIATING') ? (
                  <span className="text-amber-400 font-bold">{log}</span>
                ) : log.includes('COMPLETED') || log.includes('100%') ? (
                  <span className="text-emerald-400">{log}</span>
                ) : log.includes('Route 53') || log.includes('Promoting') ? (
                  <span className="text-cyan-400">{log}</span>
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
