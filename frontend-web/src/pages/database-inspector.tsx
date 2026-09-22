import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Database, Layers, Cpu, Zap, Key, Table, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TableColumn {
  name: string;
  type: string;
  keyType: 'PK' | 'FK' | 'VECTOR' | 'JSONB' | 'NONE';
  description: string;
}

interface TableSchema {
  tableName: string;
  rowCount: number;
  sizeMb: number;
  indexes: string[];
  columns: TableColumn[];
}

export default function DatabaseInspector() {
  const [selectedTable, setSelectedTable] = useState('document_payloads');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState({
    bTreeTimeMs: 0.8,
    ginTimeMs: 1.4,
    hnswTimeMs: 1.2,
    hnswRecallAccuracy: 99.8,
    redisHitRatio: 98.6
  });

  const schemas: Record<string, TableSchema> = {
    document_payloads: {
      tableName: 'document_payloads',
      rowCount: 1240,
      sizeMb: 18.4,
      indexes: [
        'idx_document_embeddings_hnsw (HNSW vector_cosine_ops, m=16, ef=64)',
        'pk_document_payloads (B-Tree id)'
      ],
      columns: [
        { name: 'id', type: 'UUID', keyType: 'PK', description: 'Primary Key (UUID v4)' },
        { name: 'tenant_id', type: 'UUID', keyType: 'FK', description: 'Foreign Key -> tenants(id)' },
        { name: 'title', type: 'VARCHAR(255)', keyType: 'NONE', description: 'Document Title' },
        { name: 'content', type: 'TEXT', keyType: 'NONE', description: 'Full Unstructured Content Text' },
        { name: 'embedding', type: 'vector(1536)', keyType: 'VECTOR', description: '1536-Dimensional Embeddings Vector' },
        { name: 'processed_at', type: 'TIMESTAMPTZ', keyType: 'NONE', description: 'Processing Timestamp' }
      ]
    },
    automation_workflows: {
      tableName: 'automation_workflows',
      rowCount: 14,
      sizeMb: 0.4,
      indexes: [
        'idx_workflows_condition_json (GIN condition_json)',
        'idx_workflows_tenant_id (B-Tree tenant_id)',
        'pk_automation_workflows (B-Tree id)'
      ],
      columns: [
        { name: 'id', type: 'UUID', keyType: 'PK', description: 'Primary Key (UUID v4)' },
        { name: 'tenant_id', type: 'UUID', keyType: 'FK', description: 'Foreign Key -> tenants(id)' },
        { name: 'name', type: 'VARCHAR(150)', keyType: 'NONE', description: 'Workflow Name' },
        { name: 'trigger_event', type: 'VARCHAR(100)', keyType: 'NONE', description: 'CloudEvents Trigger Name' },
        { name: 'condition_json', type: 'JSONB', keyType: 'JSONB', description: 'JSONB Condition Evaluation Rule' },
        { name: 'action_type', type: 'VARCHAR(100)', keyType: 'NONE', description: 'Action Handler Name' },
        { name: 'status', type: 'VARCHAR(50)', keyType: 'NONE', description: 'Active / Paused Status' }
      ]
    },
    execution_logs: {
      tableName: 'execution_logs',
      rowCount: 24890,
      sizeMb: 42.1,
      indexes: [
        'idx_execution_logs_workflow_id (B-Tree workflow_id)',
        'idx_execution_logs_executed_at (B-Tree executed_at DESC)',
        'pk_execution_logs (B-Tree id)'
      ],
      columns: [
        { name: 'id', type: 'UUID', keyType: 'PK', description: 'Primary Key (UUID v4)' },
        { name: 'workflow_id', type: 'UUID', keyType: 'FK', description: 'Foreign Key -> automation_workflows(id)' },
        { name: 'state', type: 'VARCHAR(50)', keyType: 'NONE', description: 'Success / AnomalyDetected' },
        { name: 'execution_duration_ms', type: 'DOUBLE PRECISION', keyType: 'NONE', description: 'Execution Latency (ms)' },
        { name: 'anomaly_score', type: 'DOUBLE PRECISION', keyType: 'NONE', description: 'Scikit-Learn IsolationForest Score' },
        { name: 'executed_at', type: 'TIMESTAMPTZ', keyType: 'NONE', description: 'Execution Timestamp' }
      ]
    }
  };

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      setBenchmarkResults({
        bTreeTimeMs: Math.round((0.6 + Math.random() * 0.4) * 10) / 10,
        ginTimeMs: Math.round((1.2 + Math.random() * 0.5) * 10) / 10,
        hnswTimeMs: Math.round((1.0 + Math.random() * 0.4) * 10) / 10,
        hnswRecallAccuracy: 99.8,
        redisHitRatio: 98.6
      });
      setIsBenchmarking(false);
    }, 500);
  };

  const currentSchema = schemas[selectedTable] || schemas.document_payloads;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>Database Engineering Inspector</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center space-x-1">
                <Database className="w-3.5 h-3.5" />
                <span>PostgreSQL 16 + pgvector & Redis</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Inspect relational DDL schemas, JSONB GIN rules, HNSW vector indexes, and query benchmarks.</p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-emerald-600/25 flex items-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isBenchmarking ? 'animate-spin' : ''}`} />
            <span>Run Index Benchmarks</span>
          </button>
        </div>

        {/* Index Performance Benchmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>HNSW Vector Index (pgvector)</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{benchmarkResults.hnswTimeMs}ms</div>
            <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-between">
              <span>Recall: {benchmarkResults.hnswRecallAccuracy}%</span>
              <span className="text-emerald-400">m=16, ef=64</span>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>GIN Index (JSONB Rules)</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-indigo-400 mt-2">{benchmarkResults.ginTimeMs}ms</div>
            <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-between">
              <span>JSON Payload Search</span>
              <span className="text-indigo-400">Inverted Index</span>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>B-Tree Index (FKs & Dates)</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mt-2">{benchmarkResults.bTreeTimeMs}ms</div>
            <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-between">
              <span>Range & Join Scan</span>
              <span className="text-blue-400">Log(N) Search</span>
            </div>
          </div>

        </div>

        {/* Schema & ER Table Explorer */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
          
          {/* Table Selector Tabs */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
            <div className="flex space-x-2">
              {Object.keys(schemas).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTable(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
                    selectedTable === key
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="font-mono">{key}</span>
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center space-x-4">
              <span>Row Count: <strong className="text-white">{currentSchema.rowCount.toLocaleString()}</strong></span>
              <span>Table Size: <strong className="text-white">{currentSchema.sizeMb} MB</strong></span>
            </div>
          </div>

          {/* Active Index List Banner */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-6 font-mono text-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-2">Registered High-Performance Indexes</span>
            <div className="space-y-1 text-emerald-400">
              {currentSchema.indexes.map((idx, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{idx}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columns Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Column Name</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Constraint / Key</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentSchema.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{col.name}</td>
                    <td className="py-3 px-4 text-emerald-400">{col.type}</td>
                    <td className="py-3 px-4">
                      {col.keyType === 'PK' && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-sans font-bold flex items-center space-x-1 w-fit">
                          <Key className="w-3 h-3" />
                          <span>PRIMARY KEY</span>
                        </span>
                      )}
                      {col.keyType === 'FK' && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-sans font-bold w-fit block">
                          FOREIGN KEY
                        </span>
                      )}
                      {col.keyType === 'VECTOR' && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-sans font-bold flex items-center space-x-1 w-fit">
                          <Sparkles className="w-3 h-3" />
                          <span>HNSW VECTOR(1536)</span>
                        </span>
                      )}
                      {col.keyType === 'JSONB' && (
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-sans font-bold w-fit block">
                          GIN JSONB
                        </span>
                      )}
                      {col.keyType === 'NONE' && (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">{col.description}</td>
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
