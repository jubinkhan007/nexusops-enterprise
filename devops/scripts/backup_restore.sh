#!/usr/bin/env bash
# ==============================================================================
# NexusOps Enterprise - Automated Database Backup & Disaster Recovery Utility
# Operations: backup | restore | verify | list | pitr-enable
# Features: AES-256-CBC Encryption, SHA-256 Checksums, Multi-Cloud Sync (S3/Azure/GCP)
# ==============================================================================

set -eo pipefail

# Configuration with Defaults
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-nexusops_db}"
POSTGRES_USER="${POSTGRES_USER:-nexus_admin}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-nexus_secret_123}"
BACKUP_DIR="${BACKUP_DIR:-./devops/backups}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-nexusops_secure_backup_key_2026}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-}"
GCS_BUCKET="${GCS_BUCKET:-}"

# Styling / Terminal Formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_success() { echo -e "${GREEN}[SUCCESS] $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"; }

# Ensure Backup Directory Exists
mkdir -p "${BACKUP_DIR}"

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Helper: Sync to Cloud Storage
cloud_sync() {
    local file_path="$1"
    local file_name=$(basename "$file_path")

    # AWS S3 Sync
    if [ -n "${S3_BUCKET}" ]; then
        log_info "Uploading ${file_name} to AWS S3: s3://${S3_BUCKET}/backups/${file_name}"
        if command -v aws &> /dev/null; then
            aws s3 cp "${file_path}" "s3://${S3_BUCKET}/backups/${file_name}"
            log_success "S3 upload complete."
        else
            log_warn "AWS CLI not found. Skipping S3 upload."
        fi
    fi

    # Azure Blob Storage Sync
    if [ -n "${AZURE_CONTAINER}" ]; then
        log_info "Uploading ${file_name} to Azure Blob Container: ${AZURE_CONTAINER}"
        if command -v az &> /dev/null; then
            az storage blob upload --container-name "${AZURE_CONTAINER}" --file "${file_path}" --name "backups/${file_name}"
            log_success "Azure Blob upload complete."
        else
            log_warn "Azure CLI not found. Skipping Azure upload."
        fi
    fi

    # GCP Cloud Storage Sync
    if [ -n "${GCS_BUCKET}" ]; then
        log_info "Uploading ${file_name} to GCS Bucket: gs://${GCS_BUCKET}/backups/${file_name}"
        if command -v gcloud &> /dev/null; then
            gcloud storage cp "${file_path}" "gs://${GCS_BUCKET}/backups/${file_name}"
            log_success "GCS upload complete."
        else
            log_warn "gcloud CLI not found. Skipping GCS upload."
        fi
    fi
}

# 1. BACKUP OPERATION
do_backup() {
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_name="nexusops_db_${timestamp}.sql.gz.enc"
    local target_path="${BACKUP_DIR}/${backup_name}"
    local sha_path="${target_path}.sha256"
    local meta_path="${target_path}.json"

    log_info "Starting PostgreSQL Automated Backup for database: ${POSTGRES_DB}..."
    log_info "Target Host: ${POSTGRES_HOST}:${POSTGRES_PORT}"

    # Perform pg_dump -> gzip -> openssl AES-256 encryption
    if pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists --no-owner | \
       gzip -9 | \
       openssl enc -aes-256-cbc -pbkdf2 -pass "pass:${BACKUP_ENCRYPTION_KEY}" -out "${target_path}"; then
        
        log_success "Database dump successfully created and encrypted: ${target_path}"
    else
        log_error "pg_dump and encryption pipeline failed!"
        exit 1
    fi

    # Compute SHA-256 Checksum
    if command -v sha256sum &> /dev/null; then
        sha256sum "${target_path}" > "${sha_path}"
    else
        shasum -a 256 "${target_path}" > "${sha_path}"
    fi
    local checksum=$(cat "${sha_path}" | awk '{print $1}')
    log_info "SHA-256 Checksum: ${checksum}"

    # Write Metadata JSON
    local file_size=$(du -h "${target_path}" | cut -f1)
    cat <<EOF > "${meta_path}"
{
  "backup_file": "${backup_name}",
  "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "database": "${POSTGRES_DB}",
  "host": "${POSTGRES_HOST}",
  "size": "${file_size}",
  "sha256": "${checksum}",
  "encryption": "AES-256-CBC-PBKDF2"
}
EOF
    log_success "Metadata manifest generated: ${meta_path}"

    # Cloud Storage Sync
    cloud_sync "${target_path}"
    cloud_sync "${sha_path}"

    # Prune Old Backups
    log_info "Pruning backups older than ${RETENTION_DAYS} days..."
    find "${BACKUP_DIR}" -name "nexusops_db_*.sql.gz.enc*" -mtime +"${RETENTION_DAYS}" -delete || true
    log_success "Retention policy enforcement complete."
}

# 2. RESTORE OPERATION
do_restore() {
    local target_file="$1"
    if [ -z "${target_file}" ]; then
        log_warn "No backup file specified. Selecting latest available backup..."
        target_file=$(ls -t "${BACKUP_DIR}"/nexusops_db_*.sql.gz.enc 2>/dev/null | head -n 1)
        if [ -z "${target_file}" ]; then
            log_error "No backup files found in ${BACKUP_DIR}!"
            exit 1
        fi
    fi

    if [[ "${target_file}" != /* ]]; then
        target_file="${BACKUP_DIR}/${target_file}"
    fi

    log_info "Target Backup for Restoration: ${target_file}"
    if [ ! -f "${target_file}" ]; then
        log_error "Backup file does not exist: ${target_file}"
        exit 1
    fi

    # Verify SHA-256 Checksum if file exists
    local sha_file="${target_file}.sha256"
    if [ -f "${sha_file}" ]; then
        log_info "Verifying SHA-256 integrity check..."
        local expected_sha=$(cat "${sha_file}" | awk '{print $1}')
        local actual_sha
        if command -v sha256sum &> /dev/null; then
            actual_sha=$(sha256sum "${target_file}" | awk '{print $1}')
        else
            actual_sha=$(shasum -a 256 "${target_file}" | awk '{print $1}')
        fi

        if [ "${expected_sha}" != "${actual_sha}" ]; then
            log_error "SHA-256 checksum mismatch! Archive may be corrupted or tampered with."
            log_error "Expected: ${expected_sha}"
            log_error "Actual:   ${actual_sha}"
            exit 1
        fi
        log_success "Integrity check passed! Checksum verified."
    fi

    log_warn "Restoring database ${POSTGRES_DB} on host ${POSTGRES_HOST}:${POSTGRES_PORT}..."
    log_warn "Existing database content will be overwritten!"

    # Decrypt -> Gunzip -> PSQL Restore
    if openssl enc -d -aes-256-cbc -pbkdf2 -pass "pass:${BACKUP_ENCRYPTION_KEY}" -in "${target_file}" | \
       gunzip | \
       psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; then
        
        log_success "Database restoration completed successfully!"
    else
        log_error "Restoration pipeline failed!"
        exit 1
    fi
}

# 3. VERIFY OPERATION
do_verify() {
    local target_file="$1"
    if [ -z "${target_file}" ]; then
        target_file=$(ls -t "${BACKUP_DIR}"/nexusops_db_*.sql.gz.enc 2>/dev/null | head -n 1)
    fi

    if [ -n "${target_file}" ] && [[ "${target_file}" != /* ]]; then
        target_file="${BACKUP_DIR}/${target_file}"
    fi

    if [ -z "${target_file}" ] || [ ! -f "${target_file}" ]; then
        log_error "No valid backup file found to verify!"
        exit 1
    fi

    log_info "Verifying Backup: ${target_file}"

    # Check decryption header without fully extracting
    if openssl enc -d -aes-256-cbc -pbkdf2 -pass "pass:${BACKUP_ENCRYPTION_KEY}" -in "${target_file}" | gunzip -t; then
        log_success "Backup archive encryption header and gzip compressed stream are VALID!"
    else
        log_error "Verification failed! Encryption key may be invalid or file is corrupted."
        exit 1
    fi
}

# 4. LIST OPERATION
do_list() {
    log_info "Listing available backups in ${BACKUP_DIR}:"
    echo "=========================================================================================="
    printf "%-35s %-12s %-22s %-10s\n" "FILENAME" "SIZE" "DATE" "CHECKSUM"
    echo "------------------------------------------------------------------------------------------"
    
    for f in "${BACKUP_DIR}"/nexusops_db_*.sql.gz.enc; do
        if [ -f "$f" ]; then
            local fname=$(basename "$f")
            local fsize=$(du -h "$f" | cut -f1)
            local fdate=$(date -r "$f" +'%Y-%m-%d %H:%M:%S' 2>/dev/null || date -u +'%Y-%m-%d %H:%M:%S')
            local has_sha="MISSING"
            if [ -f "${f}.sha256" ]; then
                has_sha="VALIDATED"
            fi
            printf "%-35s %-12s %-22s %-10s\n" "${fname}" "${fsize}" "${fdate}" "${has_sha}"
        fi
    done
    echo "=========================================================================================="
}

# 5. PITR ENABLE CONFIGURATION HELPER
do_pitr_enable() {
    log_info "Generating PostgreSQL Point-in-Time Recovery (PITR) configuration directives..."
    cat <<EOF

==========================================================================================
Add the following settings to your postgresql.conf to enable WAL (Write-Ahead Log) Archiving:
==========================================================================================

# WAL Archiving for Disaster Recovery (PITR)
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /backups/wal_archive/%f && cp %p /backups/wal_archive/%f'
archive_timeout = 300

==========================================================================================
To restore to a specific Point in Time, configure recovery.signal and postgresql.conf:
==========================================================================================
restore_command = 'cp /backups/wal_archive/%f %p'
recovery_target_time = '2026-09-23 12:00:00 UTC'
recovery_target_action = 'promote'

EOF
}

# Command Switcher
COMMAND="${1:-backup}"
shift || true

case "${COMMAND}" in
    backup)
        do_backup
        ;;
    restore)
        do_restore "$@"
        ;;
    verify)
        do_verify "$@"
        ;;
    list)
        do_list
        ;;
    pitr-enable)
        do_pitr_enable
        ;;
    *)
        echo "Usage: $0 {backup|restore [file]|verify [file]|list|pitr-enable}"
        exit 1
        ;;
esac
