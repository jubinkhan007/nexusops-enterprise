-- Migration 003: Immutable SOC 2 / HIPAA Audit Logging Ledger Table

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_name VARCHAR(150) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    state_diff_json JSONB DEFAULT '{}'::jsonb,
    compliance_category VARCHAR(50) DEFAULT 'SOC2_TYPE_II',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit_logs(compliance_category);
