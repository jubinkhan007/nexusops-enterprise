# NexusOps Enterprise - Complete Architecture Portfolio & C4 Diagrams

Welcome to the authoritative technical blueprint and architectural specification for **NexusOps Enterprise Platform v2.4**.

---

## 1. C1: System Context Diagram

The System Context diagram illustrates how external human actors and enterprise third-party services interact with the NexusOps Enterprise platform.

```mermaid
graph TD
    user_devops["DevOps Engineer / SRE"]
    user_auditor["SOC 2 / HIPAA Compliance Auditor"]
    user_operator["Platform Operator"]
    
    subgraph NexusOps["NexusOps Enterprise Platform"]
        core_system["NexusOps Multi-Tenant Core Subsystem"]
    end
    
    ext_slack["Slack API (Block Kit)"]
    ext_teams["MS Teams Webhooks"]
    ext_pagerduty["PagerDuty Events API v2"]
    ext_s3["AWS S3 / Cloud Storage"]

    user_devops -->|"Deploys workflows, monitors telemetry & HPA"| core_system
    user_auditor -->|"Audits immutable RLS logs & RBAC changes"| core_system
    user_operator -->|"Triggers workflows & executes RAG AI queries"| core_system
    
    core_system -->|"Dispatches anomaly alerts"| ext_slack
    core_system -->|"Dispatches incident payloads"| ext_teams
    core_system -->|"Triggers high-priority incidents"| ext_pagerduty
    core_system -->|"Syncs encrypted AES-256 db backups"| ext_s3
```

---

## 2. C2: Container Diagram

The Container diagram illustrates the high-level microservices, data stores, mobile applications, and event brokers composing NexusOps Enterprise.

```mermaid
graph TB
    subgraph Clients["Client Access Tier"]
        web_console["Next.js 14 Web Console (React 18 + Tailwind)"]
        android_app["Android Mobile App (Kotlin + Jetpack Compose)"]
        ios_app["iOS Mobile App (Swift + SwiftUI)"]
    end

    subgraph Security["Edge & Security Layer"]
        waf_limiter["WAF Security & Redis Rate Limiting Middleware"]
        graphql_gateway["GraphQL API Gateway (/graphql)"]
    end

    subgraph Microservices["Backend Microservices Tier"]
        dotnet_api["ASP.NET Core 8 Web API (C#)"]
        fastapi_ai["FastAPI Python AI Microservice (Python 3.11)"]
        backup_sidecar["Backup Cron Sidecar (Alpine + OpenSSL)"]
    end

    subgraph Persistence["Persistence & Messaging Tier"]
        postgres_db["PostgreSQL 16 + pgvector (HNSW Index + RLS)"]
        redis_cache["Redis 7 (SignalR Backplane & Rate Limit Counter)"]
        rabbitmq_bus["RabbitMQ 3.12 (AMQP Message Broker)"]
    end

    subgraph Observability["Observability Stack"]
        prometheus["Prometheus (Metrics Scraper)"]
        grafana["Grafana 10.2 (Telemetry Dashboards)"]
    end

    web_console --> waf_limiter
    android_app --> waf_limiter
    ios_app --> waf_limiter
    
    waf_limiter --> graphql_gateway
    graphql_gateway --> dotnet_api
    graphql_gateway --> fastapi_ai

    dotnet_api --> postgres_db
    dotnet_api --> redis_cache
    dotnet_api --> rabbitmq_bus
    
    fastapi_ai --> postgres_db
    fastapi_ai --> redis_cache
    
    backup_sidecar --> postgres_db
    
    prometheus --> dotnet_api
    prometheus --> fastapi_ai
    grafana --> prometheus
```

---

## 3. C3: Component Diagram

The Component diagram inspects internal pipelines inside the ASP.NET Core API Gateway and FastAPI AI microservice.

```mermaid
graph LR
    subgraph DotnetAPI["ASP.NET Core 8 Component Pipeline"]
        req_in["HTTP Request"] --> waf_comp["WAF Security Inspector"]
        waf_comp --> rate_comp["Redis Rate Limiter"]
        rate_comp --> tenant_comp["TenantContext RLS Injector"]
        tenant_comp --> auth_comp["JWT OAuth2 / RBAC Validator"]
        auth_comp --> gql_comp["GraphQL Engine / Controllers"]
        gql_comp --> audit_comp["SOC 2 Audit Logger"]
        gql_comp --> signalr_comp["SignalR Notification Hub"]
    end

    subgraph FastApiAI["FastAPI AI Component Pipeline"]
        ai_req["AI Request"] --> anomaly_engine["Scikit-Learn IsolationForest ML"]
        ai_req --> rag_engine["Gemini pgvector RAG Embedding Engine"]
        anomaly_engine --> alert_dispatcher["Multi-Channel Alert Dispatcher"]
    end
    
    signalr_comp --> redis_backplane["Redis Pub/Sub"]
    alert_dispatcher --> ext_hooks["Slack / Teams / PagerDuty"]
```

---

## 4. C4: Deployment Diagram (AWS EKS & Hybrid Kubernetes)

The Deployment diagram maps physical/cloud infrastructure resources on AWS EKS and Kubernetes.

```mermaid
graph TD
    subgraph AWS["AWS Cloud Region (us-east-1)"]
        subgraph VPC["AWS VPC (10.0.0.0/16)"]
            subgraph PublicSubnet["Public Subnet"]
                alb["AWS Application Load Balancer / NGINX Ingress"]
            end
            
            subgraph PrivateSubnet["Private EKS Worker Nodes (K8s Namespace: nexusops)"]
                pod_dotnet["pod: backend-dotnet (Replica: 2, HPA max 10)"]
                pod_fastapi["pod: backend-ai-fastapi (Replica: 2, HPA max 8)"]
                pod_frontend["pod: frontend-web (Replica: 2)"]
                pod_backup["pod: postgres-backup-cronjob (Cron: 0 2 * * *)"]
                pod_redis["pod: redis-statefulset"]
                pod_rabbitmq["pod: rabbitmq-deployment"]
            end
            
            subgraph DatabaseSubnet["Database Subnet"]
                rds_postgres["AWS RDS PostgreSQL 16 (pgvector + Multi-AZ)"]
            end
        end
        
        s3_bucket["AWS S3 Encrypted Backup Storage (s3://nexusops-backups)"]
    end

    alb --> pod_frontend
    alb --> pod_dotnet
    alb --> pod_fastapi
    
    pod_dotnet --> rds_postgres
    pod_dotnet --> pod_redis
    pod_dotnet --> pod_rabbitmq
    
    pod_fastapi --> rds_postgres
    pod_fastapi --> pod_redis
    
    pod_backup --> rds_postgres
    pod_backup --> s3_bucket
```

---

## 5. Enterprise Operator Runbook & SLA Directives

### Operational High Availability & Resilience SLAs
* **System Uptime Target**: 99.99% High Availability
* **Database Recovery Point Objective (RPO)**: < 5 Minutes (Point-in-Time Recovery via WAL)
* **Database Recovery Time Objective (RTO)**: < 2000 ms (Automated Connection Pool Teardown)
* **Rate Limiting Policy**: 100 requests / minute / tenant (Burst buffer: 20 req)
* **Security WAF Enforcement**: Active inspection on Query Parameters, Headers, and JSON Payloads for SQLi, XSS, and Path Traversal.

### Emergency Incident Commands
1. **Trigger Manual Database Backup**:
   ```bash
   ./devops/scripts/backup_restore.sh backup
   ```
2. **Execute Full Chaos Engineering Resilience Assessment**:
   ```bash
   ./devops/scripts/chaos_runner.sh full-assessment
   ```
3. **Verify WAF Security & Detailed Microservice Health**:
   ```bash
   curl -s http://localhost:5050/api/health/detailed | jq .
   ```
