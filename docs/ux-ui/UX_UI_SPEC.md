# 🎨 UX/UI Design Specification
## DealHive — Enterprise Deals Platform

---

## 1. Design Philosophy

| Principle         | Description                                                              |
|-------------------|--------------------------------------------------------------------------|
| **Urgency**       | Time-limited deals demand visual urgency — countdown timers, "X bought" |
| **Trust**         | Reviews, vendor ratings, and verified badges build buyer confidence      |
| **Discovery**     | Users should always find something new; browsing is as important as search|
| **Speed**         | Perceived performance is critical; skeleton screens, optimistic UI       |
| **Accessibility** | WCAG 2.1 AA — keyboard nav, screen reader support, sufficient contrast   |

---

## 2. Design Tokens

### 2.1 Color Palette
```css
:root {
  /* Primary Brand */
  --color-primary:        #1BAE6B;   /* DealHive Green */
  --color-primary-dark:   #148A52;
  --color-primary-light:  #E8F9F1;

  /* Accent */
  --color-accent:         #FF5C35;   /* Urgency / CTA Red-Orange */
  --color-accent-hover:   #E34A25;

  /* Neutrals */
  --color-gray-900:       #111827;
  --color-gray-700:       #374151;
  --color-gray-500:       #6B7280;
  --color-gray-300:       #D1D5DB;
  --color-gray-100:       #F3F4F6;
  --color-white:          #FFFFFF;

  /* Semantic */
  --color-success:        #16A34A;
  --color-warning:        #D97706;
  --color-error:          #DC2626;
  --color-info:           #2563EB;

  /* Deal Discount Badge */
  --color-badge-bg:       #FF5C35;
  --color-badge-text:     #FFFFFF;
}
```

### 2.2 Typography
```css
/* Headings */
--font-display: 'Plus Jakarta Sans', sans-serif;
/* Body */
--font-body:    'DM Sans', sans-serif;
/* Mono (codes, prices) */
--font-mono:    'JetBrains Mono', monospace;

/* Scale */
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.875rem;   /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.125rem;   /* 18px */
--text-xl:   1.25rem;    /* 20px */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  1.875rem;   /* 30px */
--text-4xl:  2.25rem;    /* 36px */
```

### 2.3 Spacing & Layout
```css
--max-content-width: 1280px;
--gutter:            1.5rem;    /* 24px */
--card-radius:       0.75rem;   /* 12px */
--button-radius:     0.5rem;    /* 8px */
--input-radius:      0.5rem;

/* Breakpoints */
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1536px;
```

---

## 3. Component Specifications

### 3.1 Deal Card
```
┌─────────────────────────────────┐
│ [PRIMARY IMAGE]        [❤ Save] │  ← 56% OFF badge top-left
│ ████████████████████████████████│
│ ████████████████████████████████│  aspect-ratio: 4/3
├─────────────────────────────────┤
│ Vendor Name • City              │  ← text-sm, gray-500
│ 60-Min Full Body Massage        │  ← text-base, font-semibold, 2 lines max
│ ★★★★½  4.7  (243 reviews)      │  ← star icons, rating, count
├─────────────────────────────────┤
│  $49          ~~$120~~           │  ← price: text-xl green, strikethrough gray
│  [BUY NOW →]                    │  ← CTA button: accent red-orange, full-width
│  ⏱ 3 days left  •  127 bought  │  ← urgency row, text-xs
└─────────────────────────────────┘
```

**States:** Default | Hover (shadow + scale 1.02) | Sold Out (overlay) | Featured (green border)

### 3.2 Deal Detail Page Layout
```
[NAVBAR]
├── Breadcrumb: Home > Health & Beauty > [Deal Title]
│
├── LEFT COLUMN (65%)
│   ├── Image Gallery (main + thumbnails)
│   ├── Deal Title (h1)
│   ├── Vendor info row (logo, name, rating, location)
│   ├── Tabs: Overview | Highlights | Fine Print | Reviews
│   └── Review list (paginated)
│
└── RIGHT COLUMN (35%) — sticky on scroll
    ├── Discount badge: "56% OFF"
    ├── Price display: $49 (was $120)
    ├── Option selector (radio cards)
    ├── Quantity selector
    ├── Countdown timer (if expiring soon)
    ├── [Add to Cart] / [Buy Now] buttons
    ├── "127 people bought this"
    ├── Voucher validity notice
    └── Share buttons
```

### 3.3 Checkout Flow
```
Step 1: Cart Review
  → Item list, quantities, promo code input, order summary

Step 2: Payment
  → Stripe Elements card form
  → Apple Pay / Google Pay (Payment Request Button)
  → Order total confirmation

Step 3: Confirmation
  → Success animation (confetti)
  → Order number
  → Voucher code(s) displayed
  → CTA: View Vouchers | Continue Shopping
```

### 3.4 Navigation Bar
```
[Logo]  [Search: "What deal are you looking for?"]  [Location]  [Notifications🔔]  [Cart🛒 (3)]  [Account▼]

Sub-nav: Local | Travel | Goods | Experiences | [City: New York ▼]
```

### 3.5 Admin Dashboard Layout
```
[Sidebar]                    [Main Content]
├── Overview                 ┌─────────────────────────────────┐
├── Deals                    │  KPI Cards: GMV | Orders | Users │
│   ├── All Deals             │  Revenue Chart (line, 30 days)   │
│   ├── Pending Approval      │  Top Deals Table                 │
│   └── Featured             │  Recent Orders Feed              │
├── Vendors                  │  Pending Approvals Alert Panel   │
├── Users                    └─────────────────────────────────┘
├── Orders
├── Finance
├── Promo Codes
├── Categories
└── Settings
```

---

## 4. Page Inventory

| Page                      | Route                        | Auth      |
|---------------------------|------------------------------|-----------|
| Homepage                  | `/`                          | Public    |
| Category Browse           | `/deals/[category]`          | Public    |
| Deal Detail               | `/deals/[slug]`              | Public    |
| Search Results            | `/search`                    | Public    |
| Cart                      | `/cart`                      | Auth      |
| Checkout                  | `/checkout`                  | Auth      |
| Order Confirmation        | `/orders/[id]/confirmation`  | Auth      |
| Order History             | `/account/orders`            | Auth      |
| Vouchers                  | `/account/vouchers`          | Auth      |
| Wishlist                  | `/account/wishlist`          | Auth      |
| Profile Settings          | `/account/settings`          | Auth      |
| Login                     | `/auth/login`                | Guest     |
| Register                  | `/auth/register`             | Guest     |
| Forgot Password           | `/auth/forgot-password`      | Guest     |
| Vendor Dashboard          | `/vendor/dashboard`          | Vendor    |
| Vendor Deals              | `/vendor/deals`              | Vendor    |
| Create/Edit Deal          | `/vendor/deals/[id]/edit`    | Vendor    |
| Voucher Scanner           | `/vendor/scan`               | Vendor    |
| Admin Overview            | `/admin`                     | Admin     |
| Admin Deals               | `/admin/deals`               | Admin     |
| Admin Vendors             | `/admin/vendors`             | Admin     |
| Admin Users               | `/admin/users`               | Admin     |
| Admin Orders              | `/admin/orders`              | Admin     |
| Admin Finance             | `/admin/finance`             | Admin     |

---

## 5. Interaction Patterns

### Loading States
- **Skeleton screens** for deal cards (not spinners)
- **Optimistic UI** for wishlist toggle (instant, reverts on error)
- **Progress indicator** for multi-step checkout

### Empty States
- Illustrated empty states with CTAs (e.g., "No deals saved yet → Browse Deals")

### Error States
- Inline form validation (on blur, not submit)
- Toast notifications for async errors (top-right, auto-dismiss 4s)
- Full-page error boundary with retry action

### Micro-interactions
- Deal card hover: subtle lift shadow + scale(1.02)
- Wishlist heart: fill animation with pop
- Add to cart: button flash → cart badge increment
- Countdown timer: last-hour red pulse animation
- Rating stars: hover fill with color transition

---

## 6. Mobile Responsiveness

| Breakpoint | Layout Changes                                     |
|------------|----------------------------------------------------|
| < 640px    | Single column, bottom nav bar, condensed cards     |
| 640–1024px | 2-column grid, collapsible filters sidebar         |
| 1024px+    | 3–4 column grid, full sidebar, sticky deal card    |

**Mobile-specific:**
- Sticky "Add to Cart" bottom bar on deal detail
- Swipeable image gallery
- Bottom sheet for filters (not sidebar)
- Large tap targets (min 44×44px)

---

## 7. SEO Specifications

```typescript
// Deal detail page metadata
export const metadata = {
  title: `${deal.title} | DealHive`,
  description: deal.shortDescription,
  openGraph: {
    title: deal.title,
    description: deal.shortDescription,
    images: [deal.primaryImageUrl],
    type: 'product',
  },
  other: {
    'product:price:amount': deal.discountedPrice,
    'product:price:currency': 'USD',
  }
}

// JSON-LD Structured Data
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": deal.title,
  "offers": {
    "@type": "Offer",
    "price": deal.discountedPrice,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": deal.avgRating,
    "reviewCount": deal.reviewCount
  }
}
```

---

*Design System Version: 1.0 | Tools: Figma, Storybook, Tailwind CSS*
