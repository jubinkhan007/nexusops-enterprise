# ==============================================================================
# Terraform Module: GCP GKE & Cloud SQL Multi-Cloud Active-Active Infrastructure
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
}

# GCP VPC Network
resource "google_compute_network" "gcp_vpc" {
  name                    = "${var.environment}-gcp-vpc"
  auto_create_subnetworks = false
}

# GCP Subnet
resource "google_compute_subnetwork" "gcp_subnet" {
  name          = "${var.environment}-gcp-subnet"
  ip_cidr_range = "10.200.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.gcp_vpc.id
}

# GCP GKE Regional Cluster
resource "google_container_cluster" "gke_cluster" {
  name     = "${var.environment}-gke-cluster"
  location = var.gcp_region
  network  = google_compute_network.gcp_vpc.name
  subnetwork = google_compute_subnetwork.gcp_subnet.name

  remove_default_node_pool = true
  initial_node_count       = 1

  workload_identity_config {
    workload_pool = "${var.gcp_project_id}.svc.id.goog"
  }
}

# GKE Managed Node Pool
resource "google_container_node_pool" "gke_nodes" {
  name       = "${var.environment}-gke-node-pool"
  location   = var.gcp_region
  cluster    = google_container_cluster.gke_cluster.name
  node_count = var.node_count

  node_config {
    preemptible  = false
    machine_type = var.machine_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = var.environment
      cloud       = "gcp"
    }
  }
}

# GCP Cloud SQL PostgreSQL Instance (Multi-Cloud HA Replica/Primary)
resource "google_sql_database_instance" "cloudsql_postgres" {
  name             = "${var.environment}-cloudsql-postgres"
  database_version = "POSTGRES_16"
  region           = var.gcp_region

  settings {
    tier = var.db_tier
    availability_type = "REGIONAL"

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = true
    }
  }

  deletion_protection = false
}

# Cloud SQL Database
resource "google_sql_database" "nexusops_db" {
  name     = "nexusops_enterprise_db"
  instance = google_sql_database_instance.cloudsql_postgres.name
}
