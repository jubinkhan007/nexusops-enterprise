import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { DollarSign, TrendingDown, HardDrive, Zap, CheckCircle2, RefreshCw, Server, Tag, PieChart } from 'lucide-react';

interface NamespaceCost {
  namespace: string;
  currentCostUsd: number;
  optimizedCostUsd: number;
  savingsUsd: number;
  wastePercentage: number;
}

interface UnattachedVolume {
  volumeId: string;
  zone: string;
  sizeGb: number;
  monthlyCostUsd: number;
  state: string;
}

export default function FinOpsPage() {
  const [currentMonthlySpend, setCurrentMonthlySpend] = useState(14250.0);
  const [optimizedSpend, setOptimizedSpend] = useState(9100.0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [namespaces, setNamespaces] = useState<NamespaceCost[]>([
    { namespace: 'nexusops-enterprise', currentCostUsd: 8450.0, optimizedCostUsd: 5200.0, savingsUsd: 3250.0, wastePercentage: 38.4 },
    { namespace: 'nexusops-ai-rag', currentCostUsd: 4200.0, optimizedCostUsd: 2800.0, savingsUsd: 1400.0, wastePercentage: 33.3 },
    { namespace: 'monitoring-logging', currentCostUsd: 1600.0, optimizedCostUsd: 1100.0, savingsUsd: 500.0, wastePercentage: 31.25 }
  ]);

  const [volumes, setVolumes] = useState<UnattachedVolume[]>([
    { volumeId: 'vol-08f1b2c3d4e5f6a', zone: 'us-east-1a', sizeGb: 250, monthlyCostUsd: 120.0, state: 'available' },
    { volumeId: 'vol-09a8b7c6d5e4f32', zone: 'us-east-1b', sizeGb: 500, monthlyCostUsd: 240.0, state: 'available' },
    { volumeId: 'vol-01c2b3a4d5e6f78', zone: 'eu-west-1a', sizeGb: 100, monthlyCostUsd: 60.0, state: 'available' },
    { volumeId: 'vol-07f6e5d4c3b2a19', zone: 'eu-west-1b', sizeGb: 100, monthlyCostUsd: 60.0, state: 'available' }
  ]);

  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[FINOPS ENGINE] Kubernetes VPA/HPA resource headroom scanner active.',
    '[AWS / GCP TAGS] Cost allocation tag finops.nexusops.io/owner enforced on 100% of pods.',
    '[STORAGE SCAN] 4 unattached persistent volumes identified ($480/mo wasted).'
  ]);

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setExecutionLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating FinOps Auto-Tuning & Volume Pruning...`,
      `[${new Date().toLocaleTimeString()}] ⚙️ Applying Kubernetes VPA CPU request patch (2000m -> 800m)...`,
      `[${new Date().toLocaleTimeString()}] 🗑️ Pruning 4 unattached EBS volumes (${volumes.map(v => v.volumeId).join(', ')})...`,
      `[${new Date().toLocaleTimeString()}] 🏷️ Tagging all untagged cloud resources with finops.nexusops.io/cost-center=engineering-core.`
    ]);

    setTimeout(() => {
      setCurrentMonthlySpend(9100.0);
      setVolumes([]);
      setNamespaces(prev => prev.map(ns => ({ ...ns, currentCostUsd: ns.optimizedCostUsd, wastePercentage: 0.0 })));
      setExecutionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ FINOPS AUTO-TUNING COMPLETED! Realized $5,150.00/month recurring cost savings.`
      ]);
      setIsOptimizing(false);
    }, 2500);
  };

  const potentialSavings = currentMonthlySpend - optimizedSpend;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>FinOps Cloud Cost & Resource Optimization | NexusOps Enterprise</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                FinOps Cloud Cost & Resource Optimization Engine
              </h1>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>36.1% Cost Reduction Realized</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Automated Kubernetes VPA/HPA resource headroom tuners, AWS/GCP cost allocation tagging, and unattached storage volume pruners.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing || volumes.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing FinOps Auto-Tuning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Execute FinOps Auto-Tuning</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cost Savings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Monthly Spend</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">
              ${currentMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">AWS & GCP Kubernetes Infrastructure</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Optimized Target Spend</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              ${optimizedSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">Post-VPA & Volume Prune Target</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Potential Monthly Savings</span>
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-teal-400 mt-2 font-mono">
              ${potentialSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-400 mt-1">36.1% Total Cloud Cost Reduction</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Unattached Volume Waste</span>
              <HardDrive className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">
              ${volumes.reduce((acc, v) => acc + v.monthlyCostUsd, 0)} <span className="text-xs font-sans font-normal">/mo</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{volumes.length} EBS/GPDisk Volumes Available</div>
          </div>
        </div>

        {/* Namespace Cost Allocation & Unattached Volume Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Namespace Allocation Table */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <span>Namespace & Tenant Cost Allocation</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Kubernetes Namespace</th>
                    <th className="pb-3">Current Spend</th>
                    <th className="pb-3">Optimized</th>
                    <th className="pb-3">Savings</th>
                    <th className="pb-3">Idle Waste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {namespaces.map(ns => (
                    <tr key={ns.namespace} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-semibold text-white flex items-center space-x-2">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ns.namespace}</span>
                      </td>
                      <td className="py-3 text-slate-300">${ns.currentCostUsd.toLocaleString()}</td>
                      <td className="py-3 text-emerald-400 font-bold">${ns.optimizedCostUsd.toLocaleString()}</td>
                      <td className="py-3 text-teal-400">${ns.savingsUsd.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${ns.wastePercentage > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {ns.wastePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unattached Volume Pruner Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <span>Unattached Volume Pruner</span>
            </h2>

            {volumes.length > 0 ? (
              <div className="space-y-3">
                {volumes.map(vol => (
                  <div key={vol.volumeId} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-slate-200">{vol.volumeId}</div>
                      <div className="text-slate-500 text-[11px]">{vol.zone} • {vol.sizeGb} GB</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">${vol.monthlyCostUsd}/mo</div>
                      <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">Unattached</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span>All unattached cloud volumes pruned cleanly! $480/month saved.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Execution Console Log */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>FinOps Engine Log & Tag Enforcement</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              VPA Mode: <span className="text-emerald-400 font-bold">Auto-Tuning Active</span>
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
            {executionLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log.includes('COMPLETED') || log.includes('saved') ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : log.includes('Initiating') || log.includes('Pruning') ? (
                  <span className="text-teal-400">{log}</span>
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
