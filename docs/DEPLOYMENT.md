# 🚀 Deployment Guide
## DealHive — Production Deployment

---

## 1. Docker Build

### Backend
```dockerfile
# backend/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/API/GrouponClone.API.csproj", "src/API/"]
COPY ["src/Application/GrouponClone.Application.csproj", "src/Application/"]
COPY ["src/Domain/GrouponClone.Domain.csproj", "src/Domain/"]
COPY ["src/Infrastructure/GrouponClone.Infrastructure.csproj", "src/Infrastructure/"]
RUN dotnet restore "src/API/GrouponClone.API.csproj"
COPY . .
RUN dotnet build "src/API/GrouponClone.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "src/API/GrouponClone.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GrouponClone.API.dll"]
```

### Frontend
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 2. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '10.x' }
      - run: dotnet restore backend/
      - run: dotnet test backend/ --no-restore --logger trx

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci && npm run test:ci

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & push Docker images
        run: |
          docker build -t dealhive-api:${{ github.sha }} ./backend
          docker build -t dealhive-web:${{ github.sha }} ./frontend
      # Push to registry, deploy to K8s / Azure App Service
```

---

## 3. Environment Variables (Production)

```env
# Never commit these — use Azure Key Vault, AWS Secrets Manager, or similar
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=...;Database=DealHiveDb;...
Jwt__Secret=<256-bit-random-secret>
Stripe__SecretKey=sk_live_...
Stripe__WebhookSecret=whsec_...
SendGrid__ApiKey=SG...
Redis__Connection=<redis-host>:6380,ssl=True,password=...
Azure__StorageConnectionString=DefaultEndpointsProtocol=https;...
```

---

## 4. SQL Server Production Checklist

- [ ] SQL Server 2022 with TCP/IP enabled
- [ ] Dedicated service account (not sa)
- [ ] TLS encryption enforced
- [ ] Regular automated backups (daily full, hourly log)
- [ ] Point-in-time restore tested
- [ ] Connection pooling configured (min 10, max 100)
- [ ] Read replica for reporting queries
- [ ] `sys.dm_exec_query_stats` monitoring enabled

---

## 5. Monitoring

```yaml
# Recommended stack
- Logs:    Serilog → Seq (dev) / Azure Monitor (prod)
- Metrics: Prometheus + Grafana
- APM:     Azure Application Insights
- Uptime:  Better Uptime / UptimeRobot
- Errors:  Sentry (frontend + backend)
- Alerts:  PagerDuty for P0/P1
```

---

*Deployment Owner: DevOps Team | Last review: Sprint 1*
