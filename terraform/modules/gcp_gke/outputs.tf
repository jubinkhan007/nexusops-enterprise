output "gke_cluster_name" {
  description = "Name of the provisioned GKE cluster"
  value       = google_container_cluster.gke_cluster.name
}

output "gke_cluster_endpoint" {
  description = "Kubernetes Master Endpoint IP for GKE cluster"
  value       = google_container_cluster.gke_cluster.endpoint
}

output "cloudsql_connection_name" {
  description = "Connection Name for GCP Cloud SQL PostgreSQL Instance"
  value       = google_sql_database_instance.cloudsql_postgres.connection_name
}

output "cloudsql_public_ip" {
  description = "Public IP Address of GCP Cloud SQL PostgreSQL Instance"
  value       = google_sql_database_instance.cloudsql_postgres.public_ip_address
}
