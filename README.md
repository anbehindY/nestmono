# nestmono

POC monorepo: NestJS + Prisma API, Next.js web, Postgres. Deploys to AWS ECS Fargate (Spot) behind a single ALB.

## Layout

- `apps/api` — NestJS + Prisma (`/api/users`, `/api/health`)
- `apps/web` — Next.js App Router, fetches from API
- `infra/` — Terraform for `ap-southeast-1`

## Local dev

```bash
docker compose up --build
# web: http://localhost:3001
# api: http://localhost:3000/api/health
```

First run: exec into the api container and push the schema:

```bash
docker compose exec api npx prisma migrate deploy
# or for dev iteration:
docker compose exec api npx prisma db push
```

## Deploy to AWS

Cost target: ~$23/mo while RDS free tier is active (12 months), ~$35/mo after.

### One-time

```bash
cd infra
terraform init
terraform apply        # creates VPC, ECR, RDS, ALB, ECS cluster + services
```

Services will be unhealthy until you push images.

### Build & push images

```bash
AWS_REGION=ap-southeast-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
ALB=$(cd infra && terraform output -raw alb_dns)

aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

# API
docker build -f apps/api/Dockerfile -t $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nestmono-api:latest .
docker push $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nestmono-api:latest

# Web (bake API URL at build time)
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://$ALB \
  -t $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nestmono-web:latest .
docker push $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nestmono-web:latest

# Force ECS to pull the new images
aws ecs update-service --cluster nestmono-cluster --service nestmono-api --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster nestmono-cluster --service nestmono-web --force-new-deployment --region $AWS_REGION
```

Visit `http://<alb_dns>` once tasks are healthy (2-3 min).

## Cost breakdown (ap-southeast-1, rough)

| Item                              | Monthly |
|-----------------------------------|--------:|
| ALB                               |    ~$18 |
| 2× Fargate Spot (0.25 vCPU/0.5GB) |     ~$6 |
| RDS db.t3.micro (free tier)       |      $0 |
| RDS storage 20GB                  |     ~$3 |
| Secrets Manager (1 secret)        |    $0.40|
| CloudWatch logs                   |     ~$1 |
| Data transfer                     |     ~$1 |
| **Total (free tier active)**      | **~$30**|

After free tier: add ~$15 for RDS → ~$45/mo. Scale Fargate tasks to 0 when not in use to cut further.

## CI/CD (GitHub Actions → AWS via OIDC)

On every push to `main`, [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds both images, pushes to ECR (tagged `:latest` and `:<short-sha>`), and forces ECS redeploys. PRs run [pr.yml](.github/workflows/pr.yml) — typecheck + build, no deploy.

### One-time setup

1. Create `infra/terraform.tfvars` from the example and set your repo:

   ```hcl
   github_repo = "your-org/nestmono"
   ```

2. Apply Terraform — this creates the OIDC provider + deploy role:

   ```bash
   cd infra && terraform apply
   terraform output -raw github_deploy_role_arn
   ```

3. In GitHub → repo → **Settings → Secrets and variables → Actions** → add secret:

   | Name | Value |
   |---|---|
   | `AWS_ROLE_ARN` | (paste the output from step 2) |

4. Push to `main`. Watch the **Actions** tab. First run takes ~5 min; subsequent runs are ~2 min thanks to Buildx cache.

### Rollback

Every deploy tags images with the git SHA, so rollback = redeploy an older image:

```bash
# Find the SHA you want to go back to
aws ecr describe-images --repository-name nestmono-api --region ap-southeast-1

# Re-tag it as :latest and force redeploy
aws ecr batch-get-image --repository-name nestmono-api --image-ids imageTag=abc1234 \
  --query 'images[0].imageManifest' --output text \
  | aws ecr put-image --repository-name nestmono-api --image-tag latest --image-manifest file:///dev/stdin
aws ecs update-service --cluster nestmono-cluster --service nestmono-api --force-new-deployment
```

## Tear down

```bash
cd infra && terraform destroy
```
