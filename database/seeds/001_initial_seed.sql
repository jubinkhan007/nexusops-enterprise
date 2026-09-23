-- NexusOps Enterprise Initial Seed Data
-- Automatically populated into PostgreSQL pgvector container upon first launch

-- Insert Default Enterprise Tenants
INSERT INTO tenants (id, name, code)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Nexus Global Enterprise', 'NEXUS_GLOBAL'),
  ('10000000-0000-0000-0000-000000000002', 'Acme Operations Corp', 'ACME_OPS')
ON CONFLICT (code) DO NOTHING;

-- Insert Seed Users
INSERT INTO users (id, tenant_id, email, full_name, role)
VALUES 
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'jubinkhan007@nexusops.enterprise.internal', 'Jubin Khan', 'Admin'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'operator@nexusops.enterprise.internal', 'Ops Lead', 'Operator'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'auditor@nexusops.enterprise.internal', 'Compliance Officer', 'Auditor')
ON CONFLICT (email) DO NOTHING;

-- Insert Seed Automation Workflows
INSERT INTO automation_workflows (id, tenant_id, name, description, trigger_event, condition_json, action_type, status)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '10000000-0000-0000-0000-000000000001',
    'Document Sentiment & Classification Pipeline',
    'Triggers AI microservice upon document upload to compute embeddings & sentiment',
    'DocumentUploaded',
    '{"fileType": "pdf", "sizeLt": 10485760}',
    'RunFastApiInference',
    'Active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '10000000-0000-0000-0000-000000000001',
    'Anomaly Detection Alerting Workflow',
    'Evaluates execution telemetry against ML model to flag system anomalies',
    'TelemetryReceived',
    '{"anomalyScoreGt": 0.85}',
    'DispatchSignalRAlert',
    'Active'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '10000000-0000-0000-0000-000000000001',
    'PostgreSQL pgvector Embedding Sync',
    'Synchronizes 1536-dim vector embeddings with pgvector HNSW index',
    'VectorSyncRequested',
    '{"dimension": 1536}',
    'ReindexHnswVectorStore',
    'Active'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Document Payloads
INSERT INTO document_payloads (id, tenant_id, title, content, content_type, category)
VALUES 
  (
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'NexusOps Anomaly Response Protocol',
    'When Scikit-Learn IsolationForest detects an anomaly score > 0.85, the workflow triggers a SignalR alert and dispatches automated webhooks to ASP.NET Core API.',
    'text/plain',
    'DevOps'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'PostgreSQL pgvector & HNSW Indexing Guide',
    'pgvector uses HNSW indexing with cosine similarity for sub-millisecond vector retrieval across 1536-dimensional embeddings.',
    'text/plain',
    'Database'
  )
ON CONFLICT (id) DO NOTHING;
