import React, { useState } from 'react';
import Head from 'next/head';
import { Header } from '../components/Header';
import { GitBranch, Play, AlertOctagon, CheckCircle2, XCircle, RefreshCw, Radio, Layers, Database } from 'lucide-react';

interface SagaStep {
  stepName: string;
  status: 'Completed' | 'FAILED' | 'COMPENSATED';
  errorMessage?: string;
  timestamp: string;
}

interface SagaExecution {
  sagaId: string;
  workflowName: string;
  status: 'Completed' | 'Compensating' | 'RolledBack';
  startedAt: string;
  completedAt?: string;
  kafkaTopic: string;
  steps: SagaStep[];
}

export default function SagaOrchestratorPage() {
  const [activeSaga, setActiveSaga] = useState<SagaExecution | null>({
    sagaId: 'saga-98f2a1b0',
    workflowName: 'Distributed Vector RAG Sync Saga',
    status: 'Completed',
    startedAt: new Date(Date.now() - 45000).toISOString(),
    completedAt: new Date().toISOString(),
    kafkaTopic: 'nexusops-saga-events',
    steps: [
      { stepName: 'WorkflowInitiated', status: 'Completed', timestamp: new Date(Date.now() - 45000).toISOString() },
      { stepName: 'VectorIngestionCompleted', status: 'Completed', timestamp: new Date(Date.now() - 30000).toISOString() },
      { stepName: 'AnomalyScanCompleted', status: 'Completed', timestamp: new Date(Date.now() - 15000).toISOString() },
      { stepName: 'AuditLedgerCommitted', status: 'Completed', timestamp: new Date().toISOString() }
    ]
  });

  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteSaga = async (simulateFailure: boolean) => {
    setIsExecuting(true);
    try {
      const res = await fetch('http://localhost:5050/api/saga/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowName: simulateFailure ? 'Failed Vector Ingestion Saga' : 'Distributed Vector RAG Sync Saga',
          simulateFailure
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSaga(data);
      } else {
        generateMockSaga(simulateFailure);
      }
    } catch {
      generateMockSaga(simulateFailure);
    } finally {
      setIsExecuting(false);
    }
  };

  const generateMockSaga = (simulateFailure: boolean) => {
    const now = new Date();
    const id = `saga-${Math.random().toString(36).substring(2, 10)}`;

    if (simulateFailure) {
      setActiveSaga({
        sagaId: id,
        workflowName: 'Failed Vector Ingestion Saga',
        status: 'RolledBack',
        startedAt: now.toISOString(),
        completedAt: new Date(now.getTime() + 800).toISOString(),
        kafkaTopic: 'nexusops-saga-compensation',
        steps: [
          { stepName: 'WorkflowInitiated', status: 'Completed', timestamp: now.toISOString() },
          { stepName: 'VectorIngestionCompleted', status: 'Completed', timestamp: new Date(now.getTime() + 200).toISOString() },
          { stepName: 'AnomalyScanFailed', status: 'FAILED', errorMessage: 'Simulated ML Model Timeout / Invalid Vector Payload', timestamp: new Date(now.getTime() + 400).toISOString() },
          { stepName: 'Compensation: PurgeUncommittedVectors', status: 'COMPENSATED', timestamp: new Date(now.getTime() + 600).toISOString() },
          { stepName: 'Compensation: RevertWorkflowState', status: 'COMPENSATED', timestamp: new Date(now.getTime() + 800).toISOString() }
        ]
      });
    } else {
      setActiveSaga({
        sagaId: id,
        workflowName: 'Distributed Vector RAG Sync Saga',
        status: 'Completed',
        startedAt: now.toISOString(),
        completedAt: new Date(now.getTime() + 600).toISOString(),
        kafkaTopic: 'nexusops-saga-events',
        steps: [
          { stepName: 'WorkflowInitiated', status: 'Completed', timestamp: now.toISOString() },
          { stepName: 'VectorIngestionCompleted', status: 'Completed', timestamp: new Date(now.getTime() + 200).toISOString() },
          { stepName: 'AnomalyScanCompleted', status: 'Completed', timestamp: new Date(now.getTime() + 400).toISOString() },
          { stepName: 'AuditLedgerCommitted', status: 'Completed', timestamp: new Date(now.getTime() + 600).toISOString() }
        ]
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Kafka Saga Orchestrator | NexusOps Enterprise</title>
      </Head>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <GitBranch className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">Kafka Saga Orchestrator</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Apache Kafka
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Distributed Event-Driven Saga Pattern, Topic Streams, and Automated Compensation Rollback Handlers
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => handleExecuteSaga(false)}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-emerald-300" />
              <span>Execute Normal Saga</span>
            </button>

            <button
              onClick={() => handleExecuteSaga(true)}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Trigger Compensation Rollback</span>
            </button>
          </div>
        </div>

        {/* Active Saga Execution Card */}
        {activeSaga && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-amber-400">{activeSaga.sagaId}</span>
                  <h2 className="text-lg font-bold text-white">{activeSaga.workflowName}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Kafka Topic: <span className="font-mono text-slate-300">{activeSaga.kafkaTopic}</span>
                </p>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  activeSaga.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {activeSaga.status === 'Completed' ? 'SAGA COMPLETED' : 'SAGA ROLLED BACK'}
                </span>
              </div>
            </div>

            {/* Step Progress Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Distributed Step Timeline & Compensation History</h3>

              <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
                {activeSaga.steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      step.status === 'Completed'
                        ? 'bg-emerald-500 text-slate-950'
                        : step.status === 'FAILED'
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-purple-500 text-slate-950'
                    }`}>
                      {step.status === 'Completed' && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      {step.status === 'FAILED' && <XCircle className="w-3 h-3 stroke-[3]" />}
                      {step.status === 'COMPENSATED' && <RefreshCw className="w-3 h-3 stroke-[3]" />}
                    </span>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-200">{step.stepName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                      </div>

                      {step.errorMessage && (
                        <p className="mt-2 text-xs font-mono text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/50">
                          Error: {step.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
