variable "domain_name" {
  description = "The root domain name for NexusOps Enterprise (e.g. nexusops.io)"
  type        = string
  default     = "nexusops-enterprise.io"
}

variable "primary_region" {
  description = "Primary active cloud region"
  type        = string
  default     = "us-east-1"
}

variable "secondary_region" {
  description = "Secondary active cloud region"
  type        = string
  default     = "eu-west-1"
}

variable "primary_lb_dns_name" {
  description = "Load balancer DNS name for primary region"
  type        = string
  default     = "nexusops-alb-useast1.elb.amazonaws.com"
}

variable "primary_lb_zone_id" {
  description = "Hosted zone ID for primary load balancer"
  type        = string
  default     = "Z35SXDOTRQ7X7K"
}

variable "secondary_lb_dns_name" {
  description = "Load balancer DNS name for secondary region"
  type        = string
  default     = "nexusops-alb-euwest1.elb.amazonaws.com"
}

variable "secondary_lb_zone_id" {
  description = "Hosted zone ID for secondary load balancer"
  type        = string
  default     = "Z32O12XQLNTSW2"
}
