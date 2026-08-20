# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DealHive** is a Groupon-style deals platform. The stack is:
- **Backend**: .NET 10 Web API (Clean Architecture) — `backend/`
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS — `frontend/`
- **Database**: PostgreSQL 16 (via Docker) — container `dealhive_postgres`
- **Cache**: Redis 7 (via Docker) — container `dealhive_redis`
- **Logging**: Seq (structured logs at `http://localhost:5341`)

## Running the Stack

```bash
# Start all infrastructure (Postgres, Redis, Seq, API, Frontend)
docker compose up -d

# Start just databases (for local dev)
docker compose up -d postgres redis seq
```

**Local dev (without Docker for app code):**
```bash
# Backend — from backend/
dotnet run --project src/GrouponClone.API

# Frontend — from frontend/
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run type-check # TypeScript check without emit
npm run lint       # ESLint
npm run format     # Prettier
```

**Tests:**
```bash
# Frontend unit tests
npm test           # watch mode
npm run test:ci    # CI mode with coverage

# Frontend E2E tests
npm run test:e2e   # Playwright
```

**Database:**
```bash
# Seed data
docker exec -i dealhive_postgres psql -U dealhive -d dealhive < backend/seed.sql

# Run EF migrations (also runs automatically in Development on startup)
dotnet ef database update --project src/GrouponClone.Infrastructure --startup-project src/GrouponClone.API
```

## Key Config

| Variable | Default | Where set |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api/v1` | `frontend/next.config.mjs` |
| `NEXT_PUBLIC_SIGNALR_URL` | `http://localhost:5000` | `frontend/next.config.mjs` |
| `ConnectionStrings__DefaultConnection` | postgres://dealhive | `docker-compose.yml` |
| `Jwt__Secret` | `super_secret_jwt_key_at_least_32_chars_long` | `docker-compose.yml` |

Swagger UI is available at `http://localhost:5000/swagger` in Development mode.

**Important**: The API URL must include `/api/v1` — the backend route prefix is `api/v1/[controller]`. Using `/api` (without `/v1`) causes 404s on all server-side fetches.

## Backend Architecture

Clean Architecture with 4 projects:

```
GrouponClone.Domain        — Entities, domain events, value objects (no dependencies)
GrouponClone.Application   — CQRS handlers (MediatR), interfaces, validators (FluentValidation)
GrouponClone.Infrastructure — EF Core DbContext, repositories, Redis, Stripe, SendGrid, Azure Blob
GrouponClone.API           — Controllers, middleware, SignalR hub, DI wiring (Program.cs)
```

**CQRS pattern**: All business logic lives in `Application/Features/*/` as MediatR `IRequest`/`IRequestHandler` pairs. Controllers only call `_mediator.Send(query/command)`. Pipeline behaviors (in order): `LoggingBehavior → ValidationBehavior → PerformanceBehavior`.

**Auth**: ASP.NET Core Identity + JWT bearer tokens. Access token = 15 min, refresh token = 30 days (HttpOnly cookie). Two authorization policies: `"AdminOnly"` (Admin/SuperAdmin roles) and `"VendorOnly"`.

**Key API endpoints:**
- `GET /api/v1/deals?category={slug}&page=1&pageSize=20` — paginated deals
- `GET /api/v1/deals/featured` — featured deals (used by homepage)
- `GET /api/v1/deals/trending` — trending deals (used by homepage)
- `GET /api/v1/deals/{slug}` — deal detail
- `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout` — revoke refresh token (POST, not DELETE)
- `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
- `GET /api/v1/users/me/wishlist` — returns `DealSummaryResponse[]` (full deal objects, not IDs)
- `POST /api/v1/users/me/wishlist` — toggle wishlist; returns `{ wishlisted: bool }`
- `GET /api/v1/orders`, `GET /api/v1/orders/{id}` — consumer order history / detail
- `GET /api/v1/vendors/me/orders` — vendor's orders (items from their deals only)
- `POST /api/v1/vendors/me/deals/{id}/submit` — submit Draft deal for approval
- `GET /api/v1/admin/deals?status={status}&page=1&pageSize=20` — all non-Draft deals
- `PUT /api/v1/admin/deals/{id}/approve`, `PUT /api/v1/admin/deals/{id}/reject`
- `PUT /api/v1/admin/deals/{id}/pause`, `PUT /api/v1/admin/deals/{id}/resume`
- `PUT /api/v1/admin/deals/{id}/submit` — admin force-submits a draft
- `GET /api/v1/admin/vendors?status={status}&page=1` — all vendors
- `PUT /api/v1/admin/vendors/{id}/approve`, `PUT /api/v1/admin/vendors/{id}/suspend`
- `GET /api/v1/admin/orders?status={status}&page=1` — all orders (admin)
- `WS /hubs/notifications` — SignalR hub

## Frontend Architecture

Next.js 14 App Router. Server Components for data fetching (homepage, listing pages). Client Components for interactive UI (cart, auth, forms).

**State management**: Redux Toolkit slices in `src/store/slices/`:
- `auth` — user session, access token, login/logout thunks (`restoreSession` called at mount in `Providers.tsx`)
- `cart` — cart items
- `deals` — deal filter state; `wishlistedIds` is `Record<string, boolean>` (NOT `Set` — Immer's MapSet plugin is not loaded)
- `notifications` — SignalR notifications

**Data fetching pattern**:
- Server Components fetch directly with `fetch()` + ISR (`next: { revalidate: 300 }`)
- Client Components use `@tanstack/react-query` + the Axios `api` client from `src/lib/api.ts`
- The `api` client auto-refreshes the JWT on 401 by calling `/auth/refresh` and retrying

**Route structure** (Groupon-style URLs):

| Route | Purpose |
|---|---|
| `/` | Homepage (featured + trending deals) |
| `/local` | All local deals listing |
| `/local/beauty-and-spas` | Beauty & Spas category |
| `/local/things-to-do` | Things To Do category |
| `/local/food-and-drink` | Food & Drink category |
| `/local/automotive` | Auto & Home category |
| `/travel` | Travel deals |
| `/goods` | Physical goods |
| `/gift` | Gift cards |
| `/search?q=` | Search results |
| `/deals/[slug]` | Deal detail page |
| `/login`, `/signup` | Auth pages |
| `/login/forgot-password` | Forgot password (email form) |
| `/login/reset-password?token=&email=` | Reset password (token + new password) |
| `/account/orders` | Order history (Consumer only) |
| `/account/orders/[id]` | Order detail (Consumer only) |
| `/account/groupons` | Vouchers — "My Groupons" (Consumer only) |
| `/account/wishlist` | Wishlist (Consumer only — sidebar layout preserved) |
| `/account/profile` | Profile settings |
| `/checkout`, `/cart` | Checkout flow |
| `/vendor/dashboard` | Vendor dashboard |
| `/vendor/deals` | Vendor deal listing |
| `/vendor/deals/new` | Create new deal |
| `/vendor/deals/[id]` | Edit deal (+ Submit for Approval button for Drafts) |
| `/vendor/orders` | Orders for vendor's deals |
| `/vendor/register` | Vendor registration (public) |
| `/admin/dashboard` | Admin dashboard with stats + pending approvals |
| `/admin/deals` | All non-Draft deals with approve/reject/pause/resume actions |
| `/admin/vendors` | All vendors with approve/suspend actions |
| `/admin/orders` | All orders with status filter |
| `/wishlist` | Redirects to `/account/wishlist` |

Old routes (`/auth/login`, `/deals/health-beauty`, `/account/vouchers`, etc.) are redirected via `next.config.mjs` `redirects()`.

**Role-based routing**: Non-Consumer users are redirected away from `/account/*`:
- Vendors → `/vendor/dashboard`
- Admin/SuperAdmin → `/admin/dashboard`
The `Navbar` hides My Orders / My Vouchers for non-Consumer roles.

**Shared components:**
- `src/components/deals/DealCard.tsx` — deal card (no CTA button, Groupon-style layout)
- `src/components/deals/DealsListingPage.tsx` — shared server component for all category listing pages
- `src/components/layout/Navbar.tsx` — full Groupon-style navbar with mega-menu dropdowns
- `src/components/providers/Providers.tsx` — wraps QueryClientProvider + Redux Provider

**Styling**: Tailwind CSS v3. Primary green `#53A318`. Custom tokens in `tailwind.config.ts`:
- `primary.DEFAULT` = `#53A318`, `primary.dark` = `#438F10`, `primary.light` = `#EFF7E6`
- `accent.DEFAULT` = `#E31837`
- Font: Inter (Google Fonts via `next/font`)

**Date handling**: The API returns dates in `"DD-MM-YYYY HH:mm:ss"` format. `new Date()` cannot parse this. Use the `parseDate()` helper in `DealCard.tsx` or `parseDateStr()` in `CountdownTimer.tsx` — never call `new Date(dateStr)` directly on API dates. Order/auth/voucher dates are returned as ISO 8601 (`"O"` format from C#) and are safe to pass to `formatDate()` or `new Date()`.

**Next.js 14 dynamic params**: In Next.js 14, `params` in page components is a plain synchronous object `{ id: string }` — NOT a `Promise`. Do not use `React.use(params)` (that is a Next.js 15 / React 19 pattern). Always type params as `{ params: { id: string } }` and destructure directly.

**Session restoration**: `restoreSession` is dispatched once at app mount in `Providers.tsx`. It calls `POST /auth/refresh` with `withCredentials: true` to exchange the HttpOnly refresh token cookie for a new access token. All `useQuery` calls in protected pages must include `enabled: !isSessionRestoring` to avoid firing unauthenticated requests before the session is restored.

## Database

PostgreSQL schema is managed by EF Core migrations (`GrouponClone.Infrastructure/Migrations/`). A seed file is at `backend/seed.sql`.

**Key schema facts:**
- `Categories` table uses integer IDs (not UUID). `beauty-spas` slug = ID `8`.
- `Deals`, `Vendors`, `Users` use UUIDs.
- Deal `Status` enum int: `0`=Draft, `1`=PendingApproval, `2`=Active, `3`=Paused, `4`=Expired, `5`=Rejected. Deal `Type`: `0`=Service, `1`=Travel, `3`=Experience.
- Category slug used in `GET /api/v1/deals?category={slug}` must match the `Slug` column exactly (e.g., `beauty-spas`, not `health-beauty`).
- When seeding new deals: check the highest existing UUID suffix in `seed.sql` for Deals (`000000000014`), Vendors (`000000000013`), Users (`000000000024`).
- Admin user: `admin@dealhive.com` / `Password1!` — Role=Admin (ID suffix `000000000024`).
- **VendorId vs UserId**: `deal.VendorId` is `Vendor.Id` (FK to Vendors table), NOT `User.Id`. Always resolve the `Vendor` entity by `UserId` first, then compare `deal.VendorId == vendor.Id`. Never compare `deal.VendorId` directly to `_currentUser.UserId`.

## Known Gotchas

1. **Category slug mismatch**: `src/app/local/beauty-and-spas/page.tsx` passes `category="health-beauty"` but the DB slug is `beauty-spas`. This returns no results and needs fixing.

2. **Stale `.next` cache**: After changing `tailwind.config.ts` or font config, delete the entire `.next/` directory before restarting. Webpack chunk resolution errors are a symptom.

3. **ISR cache poisoning**: If the server fetches an empty result and caches it, clear `.next/cache/fetch-cache`. In dev, consider adding `cache: 'no-store'` to server fetches.

4. **`lib/utils.ts` `formatDate()`** uses plain `new Date()` — only safe for ISO 8601 strings. Do not pass DD-MM-YYYY API dates to it.

5. **`api.ts` 401 redirect**: On token refresh failure, the client redirects to `/login` (updated from the old `/auth/login` path).

6. **EF Core navigation properties**: `FindAsync` / `GetByIdAsync` (from base repository) does NOT load navigation properties. Any handler needing `Vendor`, `Category`, `Images`, or `Options` must use `_db.Deals.Include(...).FirstOrDefaultAsync()` directly.

7. **Immer + Set/Map**: Redux Toolkit uses Immer. Do NOT use `Set<T>` or `Map<K,V>` in Redux state — Immer's MapSet plugin is not loaded and mutations will throw at runtime. Use `Record<string, boolean>` for ID sets and plain objects/arrays for everything else.

8. **DLL locking on Windows**: The running API process locks its DLLs. Stop `GrouponClone.API` before rebuilding: `Stop-Process -Name "GrouponClone.API" -Force` (PowerShell). Then rebuild and restart.

9. **`gh` CLI not installed**: Use `Invoke-RestMethod` against the GitHub REST API with the token from Windows Credential Manager (`git:https://github.com` entry) for PR creation and other GitHub operations.
