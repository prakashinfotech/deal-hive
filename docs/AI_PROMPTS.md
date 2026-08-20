# 🤖 AI Prompt Library
## DealHive — Developer Prompts for Claude / GPT

> Use these prompts to generate production-ready code for each layer of the application.
> Replace `{PLACEHOLDER}` values with your specifics before sending.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BACKEND — .NET 10 CLEAN ARCHITECTURE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🟦 PROMPT 1: Domain Entity
```
You are a senior .NET 10 developer using Clean Architecture and DDD.

Create a Domain Entity for `{EntityName}` in the `GrouponClone.Domain.Entities` namespace.

Requirements:
- Inherit from `BaseEntity` (has Id: Guid, CreatedAt, UpdatedAt, DeletedAt)
- Private setters for all properties (encapsulation)
- A static factory method `Create(...)` that raises a domain event
- Include relevant Value Objects where appropriate
- Include guard clauses using `ArgumentException` or custom domain exceptions
- Add XML doc comments on public members

Entity details:
{DESCRIBE THE ENTITY AND ITS PROPERTIES}

Also create:
1. The domain event `{EntityName}CreatedEvent : IDomainEvent`
2. Any relevant Value Objects
```

---

### 🟦 PROMPT 2: CQRS Command + Handler
```
You are a senior .NET 10 developer. Generate a full CQRS Command and Handler using MediatR.

Project: GrouponClone
Layer: GrouponClone.Application.Features.{Feature}.Commands
Architecture: Clean Architecture, MediatR, FluentValidation, AutoMapper

Create:
1. `{CommandName}Command : IRequest<{ResponseType}>` record
2. `{CommandName}CommandHandler : IRequestHandler<{CommandName}Command, {ResponseType}>`
3. `{CommandName}CommandValidator : AbstractValidator<{CommandName}Command>`

Handler requirements:
- Use `I{Entity}Repository` and `IUnitOfWork`
- Throw `NotFoundException` if entity not found
- Raise domain events via entity methods
- Return mapped DTO using AutoMapper

Command: {DESCRIBE WHAT THE COMMAND DOES}
Entity: {ENTITY NAME AND RELEVANT PROPERTIES}
```

---

### 🟦 PROMPT 3: CQRS Query + Handler
```
You are a senior .NET 10 developer. Generate a CQRS Query and Handler.

Project: GrouponClone
Layer: GrouponClone.Application.Features.{Feature}.Queries

Create:
1. `{QueryName}Query : IRequest<{ResponseType}>` record with query parameters
2. `{QueryName}QueryHandler : IRequestHandler<{QueryName}Query, {ResponseType}>`
3. Response DTO: `{QueryName}Response`

Handler requirements:
- Use read-only repository (`IReadRepository<T>` or direct DbContext for reads)
- Support pagination with `PaginatedList<T>` if listing
- Include EF Core query optimizations (no-tracking, projections)
- Map using AutoMapper `ProjectTo<>`

Query: {DESCRIBE WHAT IS BEING QUERIED AND FILTERS NEEDED}
```

---

### 🟦 PROMPT 4: API Controller
```
You are a senior .NET 10 developer. Generate an ASP.NET Core 10 API Controller.

Project: GrouponClone.API
Namespace: GrouponClone.API.Controllers

Create `{ControllerName}Controller : ApiControllerBase` with these endpoints:
{LIST ENDPOINTS: e.g. GET /deals, POST /deals, PUT /deals/{id}, DELETE /deals/{id}}

Requirements:
- Use `[ApiController]`, `[Route("api/v1/[controller]")]`
- Inject `IMediator` only (no services directly)
- Use `[Authorize]`, `[AllowAnonymous]`, `[Authorize(Roles = "Admin")]` appropriately
- Return `ActionResult<T>` with proper status codes
- Add `[ProducesResponseType]` attributes for Swagger
- Add XML doc comments for each action
- No business logic — only dispatch to MediatR
```

---

### 🟦 PROMPT 5: EF Core Entity Configuration
```
You are a senior .NET 10 developer using EF Core 9.

Create an `IEntityTypeConfiguration<{EntityName}>` for the `{EntityName}` entity.

Requirements:
- Configure table name, primary key, indexes
- Configure all relationships (one-to-many, many-to-many) with cascade rules
- Set max lengths on string columns (use NVARCHARs)
- Configure computed columns if any
- Configure soft delete query filter: `HasQueryFilter(e => e.DeletedAt == null)`
- Configure owned types / value objects with `OwnsOne`

Entity definition:
{PASTE ENTITY CLASS HERE}
```

---

### 🟦 PROMPT 6: Repository Implementation
```
You are a senior .NET 10 developer.

Create a Repository for `{EntityName}` implementing `I{EntityName}Repository`.

Interface location: GrouponClone.Application.Interfaces
Implementation location: GrouponClone.Infrastructure.Persistence.Repositories

Interface methods needed:
{LIST METHODS: e.g. GetByIdAsync, GetBySlugAsync, GetPagedDealsAsync, GetFeaturedDealsAsync}

Implementation requirements:
- Inject `ApplicationDbContext`
- Use async/await with CancellationToken throughout
- Use `AsNoTracking()` for read-only queries
- Apply proper EF Core Include() for navigation properties
- Implement pagination with `Skip/Take`
- Include search/filter logic using IQueryable composition
```

---

### 🟦 PROMPT 7: JWT Auth Service
```
You are a senior .NET 10 security-focused developer.

Create a complete JWT + Refresh Token authentication service for GrouponClone.

Requirements:
- Access token: JWT, 15-minute expiry, RS256 or HS256
- Refresh token: opaque, stored in DB, 7-day expiry, family-based rotation
- Refresh token reuse detection (revoke entire family on reuse)
- Store refresh tokens in `RefreshTokens` table with `FamilyId`, `ReplacedBy`, `RevokedAt`
- Create interface `IJwtTokenService` in Application layer
- Implement in Infrastructure layer
- Use `Microsoft.IdentityModel.Tokens` and `System.IdentityModel.Tokens.Jwt`
- Include: GenerateAccessToken(User), GenerateRefreshToken(), ValidateRefreshToken(token), RevokeRefreshToken(token)
```

---

### 🟦 PROMPT 8: Stripe Payment Integration
```
You are a senior .NET 10 developer integrating Stripe.

Create a complete Stripe payment service for GrouponClone.

Requirements:
- Interface: `IStripeService` in Application layer
- Implementation: `StripeService` in Infrastructure/ExternalServices/Stripe
- Methods:
  1. `CreatePaymentIntentAsync(orderId, amount, currency, metadata)` → clientSecret
  2. `CreateConnectedAccountAsync(vendor)` → Stripe account ID
  3. `ProcessVendorPayoutAsync(vendorStripeAccountId, amount, currency)` → transfer ID
  4. `RefundPaymentAsync(paymentIntentId, amount)` → refund ID
  5. `ConstructWebhookEvent(payload, signature, secret)` → Event
- Use `Stripe.net` NuGet package
- Handle all Stripe exceptions with proper mapping to domain exceptions
- Include webhook handler for: payment_intent.succeeded, charge.refunded, account.updated
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## FRONTEND — REACT 18 / NEXT.JS 14
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🟩 PROMPT 9: Deal Card Component
```
You are a senior React 18 / Next.js 14 developer using TypeScript and Tailwind CSS.

Create a `DealCard` component for a Groupon-clone called DealHive.

Design requirements:
- Show: primary image (4:3 aspect), deal title (2-line clamp), vendor name & city,
  star rating with count, original price (strikethrough), discounted price,
  discount % badge (top-left), "X bought" count, days remaining
- Wishlist heart toggle button (top-right, optimistic update)
- Hover state: shadow + scale(1.02) transition
- "Sold Out" overlay when quantity = 0
- "Featured" green border variant

Props interface:
interface DealCardProps {
  deal: {
    id: string; title: string; slug: string; shortDescription: string;
    originalPrice: number; discountedPrice: number; discountPercent: number;
    primaryImageUrl: string; vendor: { name: string; city: string };
    avgRating: number; reviewCount: number; quantitySold: number;
    expiresAt: string; isFeatured: boolean; isWishlisted?: boolean;
  };
  onWishlistToggle?: (dealId: string) => void;
}

Use Next.js `<Image>` for optimized images, `next/link` for navigation.
Include skeleton loading variant exported as `DealCardSkeleton`.
```

---

### 🟩 PROMPT 10: Deal Detail Page
```
You are a senior React 18 / Next.js 14 developer.

Create the Deal Detail page at `app/deals/[slug]/page.tsx` for DealHive.

Requirements:
- Server Component for SEO (fetch deal server-side, generate metadata)
- Left column (65%): image gallery with thumbnails, deal info tabs (Overview | Highlights | Fine Print | Reviews), review list
- Right column (35%) sticky: discount badge, price, option selector (radio cards), quantity input, countdown timer, "Add to Cart" button, social share
- Countdown timer: Client Component with `useEffect`, shows urgency red when < 24h
- Image gallery: Client Component with thumbnail switcher, lightbox on click
- Structured data (JSON-LD) for SEO
- Mobile: sticky bottom "Add to Cart" bar (fixed)
- Use `generateStaticParams` for top 1000 deals, ISR with revalidate: 300
```

---

### 🟩 PROMPT 11: Redux Store Slice
```
You are a senior React developer using Redux Toolkit with TypeScript.

Create a Redux Toolkit slice for `{sliceName}` in the DealHive frontend.

Store location: `src/store/slices/{sliceName}Slice.ts`

State shape:
{DESCRIBE THE STATE STRUCTURE}

Create:
1. The slice with reducers for all state mutations
2. Async thunks using `createAsyncThunk` for API calls (use `lib/api.ts` axios instance)
3. Selectors with `createSelector` for derived data
4. TypeScript types for state, actions, and API responses

API calls needed:
{LIST WHAT API ENDPOINTS ARE CALLED}
```

---

### 🟩 PROMPT 12: Checkout Flow
```
You are a senior React 18 / Next.js 14 developer integrating Stripe.js.

Create a complete multi-step Checkout page for DealHive.

Steps: 1) Cart Review  2) Payment  3) Confirmation

Requirements:
- Use `@stripe/react-stripe-js` and `@stripe/stripe-js`
- `loadStripe` with publishable key from env
- `<Elements>` provider wrapping the payment step
- `<CardElement>` with custom Stripe Elements styling (match DealHive design tokens)
- Payment Request Button (Apple Pay / Google Pay) if supported
- On submit: call `POST /payments/create-intent`, then `stripe.confirmCardPayment(clientSecret)`
- Handle payment errors inline (not toast — show below card field)
- On success: redirect to /orders/{id}/confirmation
- Show order summary sidebar throughout all steps
- Full TypeScript typing throughout
```

---

### 🟩 PROMPT 13: Admin Dashboard Page
```
You are a senior React developer. Create an Admin Dashboard overview page.

Framework: Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts

Include:
1. KPI cards row: Total GMV, Orders Today, New Users Today, Active Deals, Pending Approvals (with trend % vs yesterday)
2. Revenue line chart (last 30 days) using Recharts ResponsiveContainer
3. Top 5 Deals table (title, vendor, sales, revenue)
4. Pending Approvals panel (deals + vendors awaiting review, with Approve/Reject buttons)
5. Recent Orders feed (last 10, with status badges)

Data: fetch from `/admin/analytics/overview` and `/admin/deals?status=PendingApproval`
Use `react-query` (TanStack Query) for data fetching with auto-refresh every 30s.
Role guard: redirect to /auth/login if not Admin or SuperAdmin.
```

---

### 🟩 PROMPT 14: Vendor Deal Creation Form
```
You are a senior React developer. Create a multi-step Deal Creation wizard for the Vendor Portal.

Framework: React 18, Next.js 14, TypeScript, React Hook Form, Zod, Tailwind CSS

Steps:
1. Basic Info: title, category, deal type, short description
2. Pricing: original price, discounted price (auto-calculates % off), options (dynamic add/remove)
3. Details: rich description (TipTap editor), highlights (tag input), fine print, voucher validity
4. Media: drag-and-drop image upload (react-dropzone), reorder images, set primary
5. Schedule: start date, end date, quantity limit, per-user limit
6. Review & Submit: full preview of deal card + confirmation

Requirements:
- React Hook Form with Zod validation schema for each step
- Persist progress to sessionStorage (don't lose on refresh)
- Image upload: preview immediately, upload to `/vendors/me/media` on submit
- Submit sends to `POST /vendors/me/deals` then shows "Submitted for approval" state
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DATABASE PROMPTS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🟨 PROMPT 15: SQL Server Stored Procedure
```
You are a senior SQL Server developer.

Create a stored procedure for DealHive SQL Server 2022 database:

Procedure: `usp_{ProcedureName}`
Purpose: {DESCRIBE WHAT IT DOES}

Requirements:
- Use proper error handling with TRY/CATCH and RAISERROR
- Use transactions where needed
- Add SET NOCOUNT ON
- Parameter validation at start
- Return appropriate result sets or output parameters
- Include indexes used by this procedure in comments
```

---

### 🟨 PROMPT 16: EF Core Migration Script Review
```
You are a senior .NET developer. Review this EF Core migration for SQL Server:

{PASTE MIGRATION UP() METHOD HERE}

Check for:
1. Missing indexes on foreign keys
2. Missing indexes on commonly-filtered columns
3. Appropriate NULL vs NOT NULL constraints
4. Correct column types and lengths
5. Any performance concerns
6. Missing soft-delete query filters

Provide the corrected migration and explain each change.
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TESTING PROMPTS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🟥 PROMPT 17: Unit Tests
```
You are a senior .NET developer writing unit tests.

Write xUnit unit tests for `{ClassName}` in GrouponClone.

Requirements:
- Use xUnit, Moq, FluentAssertions
- Test class: `{ClassName}Tests`
- Cover: happy path, edge cases, exception scenarios
- Use `[Theory]` + `[InlineData]` for parameterized tests
- Mock all dependencies
- Use Builder pattern for test data setup
- Aim for 100% coverage of public methods

Class to test:
{PASTE CLASS HERE}
```

---

### 🟥 PROMPT 18: Integration Tests
```
You are a senior .NET developer writing integration tests.

Create integration tests for `{ControllerName}Controller` endpoints.

Framework: xUnit, WebApplicationFactory, TestContainers (SQL Server)
Project: GrouponClone.IntegrationTests

Requirements:
- Use `CustomWebApplicationFactory` that spins up a real SQL Server via TestContainers
- Seed test data in constructor
- Test each endpoint: 200/201/204 happy path, 401 unauthorized, 403 forbidden, 404 not found, 422 validation
- Use real JWT tokens generated by the test factory
- Clean up DB after each test class (not each test)

Endpoints to test:
{LIST ENDPOINTS}
```

---

*Prompt Library Version: 1.0 | Maintained by: Engineering Lead*
*Add new prompts via PR to docs/AI_PROMPTS.md*
