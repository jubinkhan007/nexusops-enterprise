#!/usr/bin/env bash

# ==============================================================================
# NexusOps Enterprise - Live Cluster Provisioning Engine (Terraform & AWS EKS)
# Automates EKS cluster, RDS PostgreSQL, ElastiCache Redis, and Multi-Region DNS creation.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TERRAFORM_DIR="${REPO_ROOT}/terraform"

AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
AUTO_APPROVE="${AUTO_APPROVE:-false}"

echo "============================================================"
echo "🌐 NexusOps Enterprise - Live Infrastructure Provisioning"
echo "Target Cloud: AWS | Region: ${AWS_REGION} | Environment: ${ENVIRONMENT}"
echo "============================================================"

# Check Prerequisite Tools
command -v terraform >/dev/null 2>&1 || { echo "❌ Error: terraform CLI is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ Error: aws CLI is required but not installed."; exit 1; }

# Validate AWS Credentials
echo "Step 1: Validating AWS Credentials & Identity..."
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ Error: Invalid AWS Credentials. Please run 'aws configure' or set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY."
    exit 1
fi
CALLER_ARN=$(aws sts get-caller-identity --query "Arn" --output text)
echo "✅ Authenticated as: ${CALLER_ARN}"

cd "${TERRAFORM_DIR}"

# Step 2: Initialize Terraform Modules
echo "Step 2: Initializing Terraform Modules & Backend..."
terraform init -reconfigure

# Step 3: Select or Create Terraform Workspace
echo "Step 3: Configuring Terraform Workspace '${ENVIRONMENT}'..."
terraform workspace select "${ENVIRONMENT}" || terraform workspace new "${ENVIRONMENT}"

# Step 4: Validate Terraform Syntax & Module Configurations
echo "Step 4: Validating Terraform Configuration..."
terraform validate

# Step 5: Generate Execution Plan
PLAN_FILE="tfplan-${ENVIRONMENT}.binary"
echo "Step 5: Generating Infrastructure Execution Plan (${PLAN_FILE})..."
terraform plan -out="${PLAN_FILE}" -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}"

# Step 6: Apply Infrastructure Configuration
if [ "${AUTO_APPROVE}" = "true" ]; then
    echo "Step 6: Applying Terraform Execution Plan (Auto-Approve Enabled)..."
    terraform apply "${PLAN_FILE}"
else
    echo ""
    read -p "❓ Do you want to apply this Terraform execution plan to AWS? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Applying Terraform Execution Plan..."
        terraform apply "${PLAN_FILE}"
    else
        echo "⏩ Aborted by user. Plan saved to ${PLAN_FILE}."
        exit 0
    fi
fi

# Step 7: Update Local Kubeconfig for EKS Cluster Access
EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "nexusops-cluster")
echo "Step 7: Updating Local Kubeconfig for EKS Cluster '${EKS_CLUSTER_NAME}'..."
aws eks update-kubeconfig --region "${AWS_REGION}" --name "${EKS_CLUSTER_NAME}"

echo "============================================================"
echo "🎉 Live AWS Infrastructure Provisioning Completed Successfully!"
echo "EKS Cluster Name: ${EKS_CLUSTER_NAME}"
echo "Run 'kubectl get nodes' to verify cluster nodes."
echo "============================================================"
