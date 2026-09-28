-- ==============================================================================
-- NexusOps Enterprise - Multi-Region Active-Active PostgreSQL Logical Replication
-- Migration: 005_multi_region_replication.sql
-- ==============================================================================

-- 1. Ensure WAL Level is configured for Logical Replication
-- Note: Requires `wal_level = logical` in postgresql.conf
ALTER SYSTEM SET wal_level = 'logical';
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET max_wal_senders = 10;

-- 2. Create Logical Replication Publication for Primary Region (us-east-1)
DROP PUBLICATION IF EXISTS nexusops_pub_us_east_1;
CREATE PUBLICATION nexusops_pub_us_east_1 FOR ALL TABLES;

-- 3. Create Logical Replication Slot for Secondary Region Sync
SELECT pg_create_logical_replication_slot('nexusops_sub_eu_west_1_slot', 'pgoutput');

-- 4. Multi-Region Last-Write-Wins Conflict Resolution Function
CREATE OR REPLACE FUNCTION resolve_multi_region_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Enforce Last-Write-Wins based on UTC timestamp and region node priority
    IF (NEW.updated_at >= OLD.updated_at) THEN
        RETURN NEW;
    ELSE
        -- Retain existing record if incoming update has stale timestamp
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Replication Lag Telemetry Helper Function
CREATE OR REPLACE FUNCTION get_multi_region_replication_lag()
RETURNS TABLE (
    client_addr inet,
    application_name text,
    state text,
    sync_state text,
    replay_lag_ms double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.client_addr,
        r.application_name,
        r.state,
        r.sync_state,
        EXTRACT(EPOCH FROM (clock_timestamp() - r.replay_lsn_ts)) * 1000.0 AS replay_lag_ms
    FROM pg_stat_replication r;
END;
$$ LANGUAGE plpgsql;
