output "dns_zone_id" {
  description = "The Route 53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "primary_health_check_id" {
  description = "Route 53 health check ID for primary region"
  value       = aws_route53_health_check.primary_us_east_1.id
}

output "secondary_health_check_id" {
  description = "Route 53 health check ID for secondary region"
  value       = aws_route53_health_check.secondary_eu_west_1.id
}

output "global_api_fqdn" {
  description = "Global latency-routed API FQDN"
  value       = aws_route53_record.primary.fqdn
}
