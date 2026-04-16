output "alb_dns" {
  value       = aws_lb.main.dns_name
  description = "Public endpoint. Web on /, API on /api/*"
}

output "ecr_api_url" {
  value = aws_ecr_repository.api.repository_url
}

output "ecr_web_url" {
  value = aws_ecr_repository.web.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_url.arn
}

output "github_deploy_role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "Paste into .github/workflows/deploy.yml as AWS_ROLE_ARN secret."
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "ecs_cluster" {
  value = aws_ecs_cluster.main.name
}
