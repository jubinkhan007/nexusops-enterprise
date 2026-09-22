import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Code, Copy, Check, Download, FileCode, Cpu, Database, Smartphone, Layers, Server } from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  techStack: string;
  language: string;
  filePath: string;
  code: string;
}

export default function CodeInspector() {
  const snippets: Record<string, CodeSnippet[]> = {
    dotnet: [
      {
        id: 'dotnet-controller',
        title: 'WorkflowsController.cs (SignalR & Simulation API)',
        techStack: 'ASP.NET Core 8 / C#',
        language: 'csharp',
        filePath: 'backend-dotnet/src/NexusOps.Api/Controllers/WorkflowsController.cs',
        code: `[ApiController]
[Route("api/[controller]")]
public class WorkflowsController : ControllerBase
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public WorkflowsController(IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpPost("trigger-simulation")]
    public async Task<ActionResult<ExecutionResultDto>> TriggerSimulation([FromBody] SimulationRequestDto dto)
    {
        var durationDev = Math.Abs(dto.ExecutionDurationMs - 45.0) / 45.0;
        var payloadDev = Math.Abs(dto.PayloadSizeKb - 10.0) / 10.0;
        var anomalyScore = Math.Min(1.0, Math.Max(0.0, durationDev * 0.7 + payloadDev * 0.3));
        var state = anomalyScore > 0.8 ? "AnomalyDetected" : "Success";

        var result = new ExecutionResultDto(
            Guid.NewGuid(), Guid.NewGuid(), state,
            dto.ExecutionDurationMs, Math.Round(anomalyScore, 4),
            $"Executed '{dto.WorkflowName}' with duration {dto.ExecutionDurationMs}ms.",
            DateTime.UtcNow
        );

        // Broadcast real-time event across SignalR WebSocket Hub
        await _hubContext.Clients.All.ReceiveWorkflowExecution(
            dto.WorkflowName, result.State, result.AnomalyScore
        );

        return Ok(result);
    }
}`
      },
      {
        id: 'dotnet-entities',
        title: 'Entities.cs (Clean Architecture Domain Models)',
        techStack: 'ASP.NET Core 8 / C#',
        language: 'csharp',
        filePath: 'backend-dotnet/src/NexusOps.Domain/Entities/Entities.cs',
        code: `public class AutomationWorkflow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TriggerEvent { get; set; } = string.Empty;
    public string ConditionJson { get; set; } = "{}";
    public string ActionType { get; set; } = string.Empty;
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<ExecutionLog> ExecutionLogs { get; set; } = new();
}`
      }
    ],
    fastapi: [
      {
        id: 'fastapi-detector',
        title: 'anomaly_detector.py (Scikit-Learn IsolationForest)',
        techStack: 'Python FastAPI / ML',
        language: 'python',
        filePath: 'backend-ai-fastapi/app/models/anomaly_detector.py',
        code: `import numpy as np
from sklearn.ensemble import IsolationForest

class ExecutionAnomalyDetector:
    def __init__(self):
        # Train lightweight IsolationForest model on execution duration & memory usage
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        normal_data = np.random.normal(loc=[45.0, 10.0], scale=[10.0, 2.0], size=(500, 2))
        self.model.fit(normal_data)

    def predict_anomaly(self, duration_ms: float, payload_kb: float) -> dict:
        features = np.array([[duration_ms, payload_kb]])
        prediction = self.model.predict(features)[0] # -1 for anomaly, 1 for normal
        decision_score = self.model.decision_function(features)[0]
        anomaly_score = max(0.0, min(1.0, 1.0 - (decision_score + 0.5)))
        return {
            "is_anomaly": bool(prediction == -1),
            "anomaly_score": round(float(anomaly_score), 4)
        }`
      },
      {
        id: 'fastapi-embeddings',
        title: 'embeddings.py (1536-Dim Vector Embeddings & RAG)',
        techStack: 'Python FastAPI / ML',
        language: 'python',
        filePath: 'backend-ai-fastapi/app/services/embeddings.py',
        code: `class GeminiRAGService:
    def generate_embedding(self, text: str) -> List[float]:
        seed = sum(ord(c) for c in text) % 10000
        vec = [math.sin(seed + i * 0.1) * math.cos(i * 0.05) for i in range(1536)]
        norm = math.sqrt(sum(x * x for x in vec))
        return [x / norm for x in vec]

    def calculate_cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        return dot / (norm_a * norm_b)`
      }
    ],
    ios: [
      {
        id: 'ios-dashboard',
        title: 'DashboardView.swift (Native SwiftUI Screen)',
        techStack: 'Swift 5.9 / SwiftUI',
        language: 'swift',
        filePath: 'mobile-ios/Views/DashboardView.swift',
        code: `import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        MetricCard(title: "Active Workflows", value: "\(viewModel.activeWorkflowsCount)", color: .blue)
                        MetricCard(title: "System Health", value: "\(viewModel.systemHealthScore)%", color: .green)
                    }

                    ForEach(viewModel.workflows) { workflow in
                        WorkflowRowView(workflow: workflow)
                    }
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
        }
    }
}`
      }
    ],
    android: [
      {
        id: 'android-screen',
        title: 'DashboardScreen.kt (Jetpack Compose UI)',
        techStack: 'Kotlin / Jetpack Compose',
        language: 'kotlin',
        filePath: 'mobile-android/app/src/main/java/com/nexusops/ui/screens/DashboardScreen.kt',
        code: `package com.nexusops.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = DashboardViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) {
        Text(text = "NexusOps Android", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(uiState.workflows) { workflow ->
                WorkflowCard(workflow = workflow)
            }
        }
    }
}`
      }
    ],
    database: [
      {
        id: 'sql-schema',
        title: '001_initial_schema.sql & 002_performance_indexes.sql',
        techStack: 'PostgreSQL 16 + pgvector',
        language: 'sql',
        filePath: 'database/migrations/001_initial_schema.sql',
        code: `-- Enable pgvector extension for high-dimensional AI vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_payloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- High-dimensional vector embedding column
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Vector Index for Sub-Millisecond AI Vector Similarity Search
CREATE INDEX idx_document_embeddings_hnsw ON document_payloads USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`
      }
    ]
  };

  const [activeCategory, setActiveCategory] = useState<keyof typeof snippets>('dotnet');
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentSnippetList = snippets[activeCategory];
  const currentSnippet = currentSnippetList[activeSnippetIndex] || currentSnippetList[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>Multi-Tech Code Inspector & Exporter</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center space-x-1">
                <Code className="w-3.5 h-3.5" />
                <span>Production Source</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Inspect and export the production code across ASP.NET Core, FastAPI ML, SwiftUI, Jetpack Compose, and SQL.</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => { setActiveCategory('dotnet'); setActiveSnippetIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeCategory === 'dotnet'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>.NET 8 ASP.NET Core</span>
          </button>

          <button
            onClick={() => { setActiveCategory('fastapi'); setActiveSnippetIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeCategory === 'fastapi'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Python FastAPI ML & RAG</span>
          </button>

          <button
            onClick={() => { setActiveCategory('ios'); setActiveSnippetIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeCategory === 'ios'
                ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>SwiftUI iOS (Swift 5.9)</span>
          </button>

          <button
            onClick={() => { setActiveCategory('android'); setActiveSnippetIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeCategory === 'android'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Jetpack Compose (Kotlin)</span>
          </button>

          <button
            onClick={() => { setActiveCategory('database'); setActiveSnippetIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeCategory === 'database'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-600/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PostgreSQL & pgvector DDL</span>
          </button>
        </div>

        {/* File Selector Pills */}
        <div className="flex space-x-2 mb-4">
          {currentSnippetList.map((snip, idx) => (
            <button
              key={snip.id}
              onClick={() => setActiveSnippetIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
                activeSnippetIndex === idx
                  ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                  : 'bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{snip.title}</span>
            </button>
          ))}
        </div>

        {/* Code Container */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex justify-between items-center font-mono text-xs">
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="text-white font-bold">{currentSnippet.filePath}</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-semibold text-[10px]">
                {currentSnippet.techStack}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition flex items-center space-x-1.5 text-xs font-sans font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-5 overflow-x-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
            <pre>{currentSnippet.code}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}
