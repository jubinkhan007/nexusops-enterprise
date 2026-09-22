variable "aws_region" {
  description = "AWS region for cloud infrastructure"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment identifier (e.g. production, staging, dev)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Name of the enterprise project"
  type        = string
  default     = "nexusops"
}

variable "vpc_cidr" {
  description = "CIDR block for the production VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "eks_node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "eks_desired_nodes" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 3
}

variable "db_instance_class" {
  description = "Database instance class for RDS PostgreSQL"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "nexusops_db"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "nexus_admin"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
  default     = "nexus_secret_123"
}
