import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { GitMerge, Activity, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, Play, PieChart, ArrowUpRight, FastForward, RotateCcw } from 'lucide-react';

interface MetricAnalysis {
  metricName: string;
  status: 'PASS' | 'FAILING' | 'PENDING';
  value: string;
  threshold: string;
}

export default function CanaryDeploymentsPage() {
  const [canaryWeight, setCanaryWeight] = useState(25);
  const [currentStep, setCurrentStep] = useState(2);
  const [phase, setPhase] = useState<'Progressing' | 'Paused' | 'Promoted' | 'RolledBack'>('Progressing');
  const [isProcessing, setIsProcessing] = useState(false);

  const [metrics, setMetrics] = useState<MetricAnalysis[]>([
    { metricName: 'success-rate (HTTP 2xx/3xx)', status: 'PASS', value: '99.98%', threshold: '>= 99.50%' },
    { metricName: 'p95-latency (Response Time)', status: 'PASS', value: '42.1 ms', threshold: '<= 200.0 ms' },
    { metricName: 'http-error-rate (5xx Errors)', status: 'PASS', value: '0.02%', threshold: '<= 0.50%' }
  ]);

  const [rolloutLogs, setRolloutLogs] = useState<string[]>([
    '[ARGO ROLLOUTS] Initialized progressive delivery for deployment nexusops-backend-canary.',
    '[TRAFFIC SHIFT] Istio VirtualService routing 25% traffic to canary pods (v2.4.0-canary).',
    '[PROMETHEUS ANALYSIS] Querying AnalysisTemplate nexusops-success-rate-analysis... (Status: PASS).'
  ]);

  const handlePromoteNextStep = () => {
    setIsProcessing(true);
    setRolloutLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 Promoting Rollout step from Step ${currentStep} (${canaryWeight}%) to Step ${currentStep + 1} (${canaryWeight + 25}%)...`,
      `[${new Date().toLocaleTimeString()}] 📡 Re-weighting Istio VirtualService subset nexusops-backend-canary-svc...`,
      `[${new Date().toLocaleTimeString()}] 📊 Prometheus AnalysisTemplate evaluation: ALL SLA METRICS PASSED.`
    ]);

    setTimeout(() => {
      const nextWeight = canaryWeight >= 75 ? 100 : canaryWeight + 25;
      const nextStep = currentStep >= 4 ? 4 : currentStep + 1;
      setCanaryWeight(nextWeight);
      setCurrentStep(nextStep);
      if (nextWeight === 100) setPhase('Promoted');
      setRolloutLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ PROMOTION COMPLETED! Traffic split updated to ${100 - nextWeight}% Stable / ${nextWeight}% Canary.`
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleRollback = () => {
    setIsProcessing(true);
    setRolloutLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚠️ ABORTING CANARY ROLLOUT & INITIATING ZERO-DOWNTIME ROLLBACK...`,
      `[${new Date().toLocaleTimeString()}] 🔄 Instantly shifting 100% traffic back to stable version v2.3.9-stable...`
    ]);

    setTimeout(() => {
      setCanaryWeight(0);
      setPhase('RolledBack');
      setRolloutLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ ZERO-DOWNTIME ROLLBACK COMPLETED! 100% traffic restored to stable v2.3.9.`
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  const stableWeight = 100 - canaryWeight;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>Zero-Downtime Canary Deployments | NexusOps Enterprise</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <GitMerge className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Zero-Downtime Blue/Green & Canary Rollout Controller
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                phase === 'Promoted'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : phase === 'RolledBack'
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Argo Rollouts Phase: {phase}</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Automated progressive delivery canary releases (10% → 25% → 50% → 100%) with Prometheus error-rate validation and automated rollback capabilities.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleRollback}
              disabled={isProcessing || phase === 'RolledBack'}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-sm font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Abort & Rollback</span>
            </button>

            <button
              onClick={handlePromoteNextStep}
              disabled={isProcessing || phase === 'Promoted' || phase === 'RolledBack'}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Promoting Step...</span>
                </>
              ) : (
                <>
                  <FastForward className="w-4 h-4 fill-current" />
                  <span>Promote Canary Step</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Traffic Split & Rollout Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Live Traffic Split Visualizer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              <span>Live Traffic Split Ratio</span>
            </h2>

            <div className="space-y-4">
              {/* Stable Traffic */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Stable (v2.3.9)</span>
                  </span>
                  <span className="text-blue-400 font-bold">{stableWeight}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stableWeight}%` }}
                  ></div>
                </div>
              </div>

              {/* Canary Traffic */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>Canary (v2.4.0)</span>
                  </span>
                  <span className="text-purple-400 font-bold">{canaryWeight}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${canaryWeight}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Routing Engine:</span>
                  <span className="text-slate-200">Istio VirtualService</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Step:</span>
                  <span className="text-purple-400 font-bold">Step {currentStep} of 4 ({canaryWeight}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Rollout Timeline */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Argo Rollouts Progressive Traffic Steps</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: 1, weight: 10, pause: '5 min', status: currentStep > 1 ? 'COMPLETED' : currentStep === 1 ? 'ACTIVE' : 'PENDING' },
                { step: 2, weight: 25, pause: '10 min', status: currentStep > 2 ? 'COMPLETED' : currentStep === 2 ? 'ACTIVE' : 'PENDING' },
                { step: 3, weight: 50, pause: '15 min', status: currentStep > 3 ? 'COMPLETED' : currentStep === 3 ? 'ACTIVE' : 'PENDING' },
                { step: 4, weight: 100, pause: 'Full Promote', status: currentStep === 4 ? 'ACTIVE' : 'PENDING' }
              ].map(st => (
                <div
                  key={st.step}
                  className={`p-4 rounded-xl border font-mono text-xs transition ${
                    st.status === 'ACTIVE'
                      ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : st.status === 'COMPLETED'
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                      : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">Step {st.step}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.status === 'ACTIVE' ? 'bg-purple-500 text-white' : st.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {st.status}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-white mb-1">{st.weight}% <span className="text-xs text-slate-400 font-sans font-normal">Canary</span></div>
                  <div className="text-[11px] text-slate-400">Pause: {st.pause}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prometheus Metric Analysis Cards */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Prometheus AnalysisTemplate Health Evaluators</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map(m => (
            <div key={m.metricName} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{m.metricName}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-mono">
                  {m.status}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                {m.value}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">SLA Threshold Condition: {m.threshold}</div>
            </div>
          ))}
        </div>

        {/* Live Rollout Execution Console Log */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Argo Rollouts & Istio Traffic Controller Stream</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Controller: <span className="text-purple-400 font-bold">Argo Rollouts v1.6.0</span>
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
            {rolloutLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log.includes('PROMOTED') || log.includes('PASSED') ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : log.includes('INITIATING') || log.includes('ABORTING') ? (
                  <span className="text-amber-400 font-bold">{log}</span>
                ) : log.includes('ISTIO') || log.includes('Shifting') ? (
                  <span className="text-purple-400">{log}</span>
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
