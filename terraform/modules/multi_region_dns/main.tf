# ==============================================================================
# NexusOps Enterprise - Multi-Region Latency-Based Cloud DNS & Health Checks
# ==============================================================================

resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = "NexusOps Multi-Region Active-Active Cloud DNS Zone"

  tags = {
    Environment = "production"
    ManagedBy   = "Terraform"
    Topology    = "Multi-Region-Active-Active"
  }
}

# Route 53 Health Check - Primary Region (us-east-1)
resource "aws_route53_health_check" "primary_us_east_1" {
  fqdn              = "api-us-east-1.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health/detailed"
  failure_threshold = 3
  request_interval  = 10

  tags = {
    Name   = "nexusops-health-us-east-1"
    Region = var.primary_region
  }
}

# Route 53 Health Check - Secondary Region (eu-west-1)
resource "aws_route53_health_check" "secondary_eu_west_1" {
  fqdn              = "api-eu-west-1.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health/detailed"
  failure_threshold = 3
  request_interval  = 10

  tags = {
    Name   = "nexusops-health-eu-west-1"
    Region = var.secondary_region
  }
}

# Latency-Based DNS Record - Primary (us-east-1)
resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  set_identifier = "us-east-1-primary"
  latency_routing_policy {
    region = var.primary_region
  }

  alias {
    name                   = var.primary_lb_dns_name
    zone_id                = var.primary_lb_zone_id
    evaluate_target_health = true
  }

  health_check_id = aws_route53_health_check.primary_us_east_1.id
}

# Latency-Based DNS Record - Secondary (eu-west-1)
resource "aws_route53_record" "secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  set_identifier = "eu-west-1-secondary"
  latency_routing_policy {
    region = var.secondary_region
  }

  alias {
    name                   = var.secondary_lb_dns_name
    zone_id                = var.secondary_lb_zone_id
    evaluate_target_health = true
  }

  health_check_id = aws_route53_health_check.secondary_eu_west_1.id
}
