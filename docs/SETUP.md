# ⚙️ Development Setup Guide
## DealHive — Local Environment

---

## Prerequisites

| Tool              | Version     | Install                              |
|-------------------|-------------|--------------------------------------|
| .NET SDK          | 10.0+       | https://dotnet.microsoft.com         |
| Node.js           | 20 LTS+     | https://nodejs.org                   |
| SQL Server        | 2022        | Docker or local install              |
| Redis             | 7+          | Docker recommended                   |
| Docker Desktop    | Latest      | https://docker.com                   |
| Git               | Latest      | https://git-scm.com                  |

---

## 1. Clone & Environment Setup

```bash
git clone https://github.com/your-org/dealhive.git
cd dealhive
cp .env.example .env         # fill in secrets
```

### .env (root)
```env
# Database
SQL_SERVER_CONNECTION=Server=localhost,1433;Database=DealHiveDb;User Id=sa;Password=YourStr0ngPassword!;TrustServerCertificate=True

# JWT
JWT_SECRET=your-256-bit-secret-key-minimum-32-chars
JWT_ISSUER=https://api.dealhive.com
JWT_AUDIENCE=https://dealhive.com
JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_CONNECTION=localhost:6379

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@dealhive.com

# Azure Blob / S3
STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
STORAGE_CONTAINER_NAME=dealhive-media

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 2. Docker (Recommended for DB + Redis)

```bash
# Start SQL Server + Redis with Docker Compose
docker-compose up -d

# docker-compose.yml included at project root
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStr0ngPassword!"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

volumes:
  sqldata:
```

---

## 3. Backend Setup (.NET 10)

```bash
cd backend/src/API

# Restore packages
dotnet restore

# Apply EF Core migrations
dotnet ef database update --project ../Infrastructure

# Seed initial data (categories, admin user)
dotnet run --seed

# Run API (http://localhost:5000)
dotnet run

# Swagger UI available at:
# http://localhost:5000/swagger
```

### EF Core Migration Commands
```bash
# Add new migration
dotnet ef migrations add MigrationName \
  --project ../Infrastructure \
  --startup-project .

# Apply migrations
dotnet ef database update \
  --project ../Infrastructure \
  --startup-project .

# Rollback
dotnet ef database update PreviousMigrationName \
  --project ../Infrastructure
```

---

## 4. Frontend Setup (React / Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build
npm run start

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test
```

### Frontend package.json scripts
```json
{
  "scripts": {
    "dev":         "next dev",
    "build":       "next build",
    "start":       "next start",
    "lint":        "next lint",
    "type-check":  "tsc --noEmit",
    "test":        "jest --watch",
    "test:ci":     "jest --ci",
    "storybook":   "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## 5. Stripe Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local API
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe

# Test a payment event
stripe trigger payment_intent.succeeded
```

---

## 6. Project Structure — Key Files

```
backend/src/API/
  Program.cs                    ← App entry point, DI registration
  appsettings.json              ← Config (no secrets here)
  appsettings.Development.json  ← Dev overrides

backend/src/Infrastructure/
  Persistence/
    ApplicationDbContext.cs     ← EF Core DbContext
    Configurations/             ← IEntityTypeConfiguration<T> per entity
    Repositories/               ← IRepository<T> implementations
  Identity/
    JwtTokenService.cs          ← Token generation & validation

frontend/src/
  app/layout.tsx                ← Root layout (providers, fonts)
  app/page.tsx                  ← Homepage
  lib/api.ts                    ← Axios instance with interceptors
  store/index.ts                ← Redux store
  types/index.ts                ← All shared TypeScript interfaces
```

---

## 7. Running Tests

```bash
# Backend unit tests
cd backend
dotnet test tests/GrouponClone.UnitTests

# Backend integration tests (requires DB)
dotnet test tests/GrouponClone.IntegrationTests

# Frontend tests
cd frontend
npm test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 8. Code Quality

```bash
# .NET code formatting
dotnet format

# Frontend ESLint + Prettier
npm run lint
npm run format

# Pre-commit hooks (Husky)
# Automatically runs lint + type-check before each commit
```

---

## 9. Useful URLs (Local)

| Service         | URL                          |
|-----------------|------------------------------|
| Frontend        | http://localhost:3000        |
| API             | http://localhost:5000        |
| Swagger UI      | http://localhost:5000/swagger|
| Redis Commander | http://localhost:8081        |
| Seq (Logs)      | http://localhost:5341        |

---

*Last updated: 2025 | Platform: Windows / macOS / Linux*
