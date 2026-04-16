variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project" {
  type    = string
  default = "nestmono"
}

variable "db_username" {
  type    = string
  default = "nestmono"
}

variable "db_name" {
  type    = string
  default = "nestmono"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in 'owner/name' form, used to scope the OIDC deploy role."
  # Example: "alfie/nestmono". Set in terraform.tfvars before apply.
}

variable "deploy_branch" {
  type        = string
  description = "Branch that triggers production deploys via OIDC."
  default     = "main"
}
