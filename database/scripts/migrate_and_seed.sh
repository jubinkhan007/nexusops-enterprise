#!/usr/bin/env bash

# ==============================================================================
# NexusOps Enterprise - Production Database Migration & Seeding Runner
# Runs schema migrations idempotently using a tracking table `schema_migrations`.
# ==============================================================================

set -euo pipefail

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-nexusops_db}"
DB_USER="${POSTGRES_USER:-postgres}"
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
export PGPASSWORD

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "============================================================"
echo "🚀 NexusOps Enterprise Production Database Migration Runner"
echo "Target Host: ${DB_HOST}:${DB_PORT} | Database: ${DB_NAME}"
echo "============================================================"

# Ensure database migration tracking table exists
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<'EOF'
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

apply_migration() {
    local sql_file="$1"
    local filename
    filename="$(basename "${sql_file}")"

    # Check if migration already applied
    local applied
    applied=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -A -c "SELECT COUNT(1) FROM schema_migrations WHERE filename = '${filename}';")

    if [ "${applied}" -eq "0" ]; then
        echo "Applying migration: ${filename}..."
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "${sql_file}"
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (filename) VALUES ('${filename}');"
        echo "✅ Successfully applied ${filename}"
    else
        echo "⏩ Skipping ${filename} (already applied)"
    fi
}

echo "Step 1: Running Core Schema Migrations..."
if [ -f "${BASE_DIR}/migrations/001_initial_schema.sql" ]; then
    apply_migration "${BASE_DIR}/migrations/001_initial_schema.sql"
fi

if [ -f "${BASE_DIR}/indexing/002_performance_indexes.sql" ]; then
    apply_migration "${BASE_DIR}/indexing/002_performance_indexes.sql"
fi

if [ -f "${BASE_DIR}/migrations/003_audit_logs.sql" ]; then
    apply_migration "${BASE_DIR}/migrations/003_audit_logs.sql"
fi

if [ -f "${BASE_DIR}/migrations/004_tenant_rls.sql" ]; then
    apply_migration "${BASE_DIR}/migrations/004_tenant_rls.sql"
fi

if [ -f "${BASE_DIR}/005_multi_region_replication.sql" ]; then
    apply_migration "${BASE_DIR}/005_multi_region_replication.sql"
fi

echo "Step 2: Checking Production Seeds..."
if [ "${SEED_DATA:-false}" = "true" ] && [ -f "${BASE_DIR}/seeds/001_initial_seed.sql" ]; then
    echo "Applying production initial seeds..."
    apply_migration "${BASE_DIR}/seeds/001_initial_seed.sql"
fi

echo "============================================================"
echo "🎉 Production Database Schema Migration Completed Successfully!"
echo "============================================================"
