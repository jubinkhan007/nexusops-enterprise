#!/usr/bin/env bash

# ==============================================================================
# NexusOps Enterprise - GitHub Actions Secrets Automator
# Configures GitHub Actions repository secrets for CI/CD continuous deployment.
# ==============================================================================

set -euo pipefail

REPO="jubinkhan007/nexusops-enterprise"

echo "============================================================"
echo "🔑 NexusOps Enterprise - GitHub Repository Secrets Configurator"
echo "Target Repository: ${REPO}"
echo "============================================================"

# Check Prerequisites
command -v gh >/dev/null 2>&1 || { echo "❌ Error: gh CLI is required but not installed."; exit 1; }

# Validate GitHub Authentication
if ! gh auth status >/dev/null 2>&1; then
    echo "❌ Error: Not authenticated with GitHub CLI. Please run 'gh auth login'."
    exit 1
fi

set_secret() {
    local key="$1"
    local value="$2"
    if [ -n "${value}" ]; then
        echo "Setting GitHub Secret: ${key}..."
        echo "${value}" | gh secret set "${key}" --repo "${REPO}"
        echo "✅ Configured ${key}"
    else
        echo "⏩ Skipping ${key} (empty value)"
    fi
}

echo "Enter your production secret values (or press ENTER to skip):"

read -rs -p "AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID; echo ""
read -rs -p "AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY; echo ""
read -r -p "AWS_REGION [us-east-1]: " AWS_REGION; AWS_REGION="${AWS_REGION:-us-east-1}"
read -rs -p "POSTGRES_PASSWORD: " POSTGRES_PASSWORD; echo ""
read -rs -p "JWT_SECRET: " JWT_SECRET; echo ""
read -r -p "SLACK_WEBHOOK_URL: " SLACK_WEBHOOK_URL
read -r -p "PAGERDUTY_API_KEY: " PAGERDUTY_API_KEY

echo ""
echo "Uploading Production Secrets to GitHub..."
set_secret "AWS_ACCESS_KEY_ID" "${AWS_ACCESS_KEY_ID}"
set_secret "AWS_SECRET_ACCESS_KEY" "${AWS_SECRET_ACCESS_KEY}"
set_secret "AWS_REGION" "${AWS_REGION}"
set_secret "POSTGRES_PASSWORD" "${POSTGRES_PASSWORD}"
set_secret "JWT_SECRET" "${JWT_SECRET}"
set_secret "SLACK_WEBHOOK_URL" "${SLACK_WEBHOOK_URL}"
set_secret "PAGERDUTY_API_KEY" "${PAGERDUTY_API_KEY}"

echo "============================================================"
echo "🎉 All Production GitHub Secrets Configured Successfully!"
echo "Your GitHub Actions CI/CD pipeline is ready to execute live deployments!"
echo "============================================================"
