-- Migration 004: Multi-Tenant PostgreSQL Row-Level Security (RLS) Isolation

-- Enable Row-Level Security on Multi-Tenant Tables
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Tenant Data Privacy

-- 1. Automation Workflows Tenant RLS Policy
DROP POLICY IF EXISTS tenant_isolation_workflows ON automation_workflows;
CREATE POLICY tenant_isolation_workflows ON automation_workflows
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    OR current_setting('app.current_tenant_id', true) IS NULL
  );

-- 2. Document Payloads pgvector Tenant RLS Policy
DROP POLICY IF EXISTS tenant_isolation_documents ON document_payloads;
CREATE POLICY tenant_isolation_documents ON document_payloads
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    OR current_setting('app.current_tenant_id', true) IS NULL
  );

-- 3. Execution Logs Tenant RLS Policy
DROP POLICY IF EXISTS tenant_isolation_execution_logs ON execution_logs;
CREATE POLICY tenant_isolation_execution_logs ON execution_logs
  FOR ALL
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows 
      WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    OR current_setting('app.current_tenant_id', true) IS NULL
  );

-- 4. Audit Logs Tenant RLS Policy
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    OR current_setting('app.current_tenant_id', true) IS NULL
  );
