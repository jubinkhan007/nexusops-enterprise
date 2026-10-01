# NexusOps Enterprise - Live Production Deployment & Continuous Delivery (CD) Guide

Welcome to the **Live Production Deployment & Continuous Delivery Guide** for **NexusOps Enterprise**. This guide provides step-by-step instructions for provisioning live AWS infrastructure, configuring GitHub Actions secrets, and executing zero-downtime deployments.

---

## 1. Prerequisites & Tooling Setup

Before initiating live infrastructure provisioning, ensure your local workstation or CI runner has the following tools installed and authenticated:

* **AWS CLI (v2.15+)**: Authenticated with administrator or EKS management IAM privileges (`aws configure`).
* **Terraform (v1.7+)**: Installed locally for IaC provisioning (`terraform --version`).
* **kubectl (v1.29+)**: Kubernetes cluster management CLI.
* **GitHub CLI (gh)**: Authenticated with `gh auth login` for managing repository secrets.

---

## 2. Infrastructure Provisioning via Terraform

NexusOps Enterprise provides an automated provisioning script [`devops/scripts/provision_cluster.sh`](file:///Users/mac/.gemini/antigravity/scratch/nexus-enterprise-platform/devops/scripts/provision_cluster.sh) that initializes and applies Terraform modules located in [`terraform/`](file:///Users/mac/.gemini/antigravity/scratch/nexus-enterprise-platform/terraform).

### Step-by-Step Provisioning

```bash
# Set target AWS region and environment
export AWS_REGION="us-east-1"
export ENVIRONMENT="production"

# Execute live cluster provisioning engine
bash devops/scripts/provision_cluster.sh
```

### Provisioned Cloud Resources:
* **VPC**: 3-AZ public & private subnets, NAT Gateways, Internet Gateway.
* **EKS Cluster**: Managed Kubernetes node groups (`t3.xlarge` / `m5.xlarge`) with IRSA IAM roles.
* **RDS PostgreSQL**: Multi-AZ PostgreSQL 16 instance with automated snapshots and storage encryption.
* **ElastiCache Redis**: High-availability Redis cluster mode with in-transit and at-rest encryption.
* **Route 53 DNS**: Latency-based active-active DNS routing with failover health checks.

---

## 3. GitHub Actions Secrets Configuration

To enable automated Continuous Deployment (CD) on git push, configure repository secrets using [`devops/scripts/configure_github_secrets.sh`](file:///Users/mac/.gemini/antigravity/scratch/nexus-enterprise-platform/devops/scripts/configure_github_secrets.sh) or the GitHub CLI:

```bash
# Execute interactive GitHub secret automator
bash devops/scripts/configure_github_secrets.sh
```

### Required Repository Secrets Table:

| Secret Name | Description | Example / Format |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS IAM User Access Key | `AKIAXXXXXXXXXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | Primary Deployment Region | `us-east-1` |
| `POSTGRES_PASSWORD` | Production DB Administrator Password | `SuperSecr3tDBPassw0rd!` |
| `JWT_SECRET` | HMAC SHA256 Signing Key | `min-64-character-super-secret-key-string` |
| `SLACK_WEBHOOK_URL` | Production Alert Slack Webhook | `https://hooks.slack.com/services/...` |
| `PAGERDUTY_API_KEY` | PagerDuty Incident Escalation Key | `pd_live_secret_key_12345` |

---

## 4. Continuous Deployment Pipeline Execution

The pipeline [`ci-cd-pipeline.yml`](file:///Users/mac/.gemini/antigravity/scratch/nexus-enterprise-platform/.github/workflows/ci-cd-pipeline.yml) automatically triggers upon every push to the `main` branch.

### Workflow Execution Stages:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD Deployment Flow                   │
├──────────────────────────────────────────────────────────────────────────┤
│ 1. 🧪 Build & Test Suite (C# .NET xUnit, Python pytest, Next.js build)   │
│ 2. 🏗️ Terraform Infrastructure Validation (fmt, validate, plan)         │
│ 3. 🔐 AWS Credentials Authentication & Kubeconfig Retrieval              │
│ 4. 📦 ECR / GHCR Container Image Building & Tagging                      │
│ 5. ☸️ Kubernetes & Zero-Trust Istio Service Mesh Deployment (`kubectl`)   │
│ 6. 🚀 Argo Rollouts Canary Release ($10\% \to 25\% \to 50\% \to 100\%$)    │
│ 7. 🛡️ Post-Deployment Canary Verification & Prometheus Error Audit        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Day-2 Operations, Monitoring & Rollbacks

### 1. Manual Kubeconfig Update & Cluster Access
```bash
aws eks update-kubeconfig --region us-east-1 --name nexusops-cluster
kubectl get pods -n nexusops
```

### 2. Manual Database Migration Execution
```bash
export POSTGRES_HOST=$(aws rds describe-db-instances --db-instance-identifier nexusops-postgres --query "DBInstances[0].Endpoint.Address" --output text)
export POSTGRES_PASSWORD="YourProductionPassword"
bash database/scripts/migrate_and_seed.sh
```

### 3. Emergency Canary Rollback
If a canary release shows metric anomalies, run the automated rollback verifier:
```bash
bash devops/scripts/canary_deployment_verifier.sh
```
Or execute manual kubectl rollback:
```bash
kubectl argo rollouts undo rollout-canary -n nexusops
```

---
*NexusOps Enterprise Deployment Guide – Version 2.0 – Production Ready*
