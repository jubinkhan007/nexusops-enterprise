variable "gcp_project_id" {
  description = "Google Cloud Platform Project ID"
  type        = string
  default     = "nexusops-enterprise-prod"
}

variable "gcp_region" {
  description = "GCP Deployment Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment Environment"
  type        = string
  default     = "production"
}

variable "node_count" {
  description = "Number of nodes per zone in GKE cluster"
  type        = number
  default     = 2
}

variable "machine_type" {
  description = "GCP Compute Engine machine type for GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "db_tier" {
  description = "GCP Cloud SQL instance machine tier"
  type        = string
  default     = "db-custom-2-7680"
}
