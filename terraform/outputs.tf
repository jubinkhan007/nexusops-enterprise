output "vpc_id" {
  description = "ID of the created VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "Name of the EKS Kubernetes cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint API for the EKS Kubernetes cluster"
  value       = module.eks.cluster_endpoint
}

output "rds_postgres_endpoint" {
  description = "Connection endpoint for RDS PostgreSQL"
  value       = module.rds.db_endpoint
}

output "elasticache_redis_endpoint" {
  description = "Primary endpoint for ElastiCache Redis cluster"
  value       = module.elasticache.redis_endpoint
}

output "kubectl_config_command" {
  description = "CLI command to update local kubeconfig for the new cluster"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${module.eks.cluster_name}"
}
