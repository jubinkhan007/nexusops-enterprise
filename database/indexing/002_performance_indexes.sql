-- 1. B-Tree Indexes for Foreign Keys & Timestamp Range Filtering
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_workflows_tenant_id ON automation_workflows(tenant_id);
CREATE INDEX idx_execution_logs_workflow_id ON execution_logs(workflow_id);
CREATE INDEX idx_execution_logs_executed_at ON execution_logs(executed_at DESC);

-- 2. GIN Index for Fast JSONB Condition Filtering
CREATE INDEX idx_workflows_condition_json ON automation_workflows USING GIN (condition_json);

-- 3. HNSW (Hierarchical Navigable Small World) Vector Index for Sub-Millisecond AI Vector Similarity Search
CREATE INDEX idx_document_embeddings_hnsw ON document_payloads USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
