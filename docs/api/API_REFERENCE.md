# 📡 API Reference
## DealHive — REST API v1

**Base URL:** `https://api.dealhive.com/api/v1`  
**Auth:** `Authorization: Bearer {accessToken}`  
**Content-Type:** `application/json`

---

## Authentication

### POST /auth/register
```json
// Request
{ "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "password": "P@ssw0rd!" }

// Response 201
{ "userId": "uuid", "email": "jane@example.com", "message": "Verify your email." }
```

### POST /auth/login
```json
// Request
{ "email": "jane@example.com", "password": "P@ssw0rd!" }

// Response 200
{ "accessToken": "eyJ...", "expiresIn": 900, "user": { "id": "uuid", "email": "...", "role": "Consumer" } }
// refreshToken set via HttpOnly cookie
```

### POST /auth/refresh
```json
// refreshToken read from cookie
// Response 200
{ "accessToken": "eyJ...", "expiresIn": 900 }
```

### POST /auth/logout
```json
// Revokes refresh token
// Response 204
```

### POST /auth/forgot-password
```json
{ "email": "jane@example.com" }
// Response 200 (always, to prevent enumeration)
```

### POST /auth/reset-password
```json
{ "token": "otp-token", "email": "jane@example.com", "newPassword": "NewP@ss!" }
```

### POST /auth/verify-email
```json
{ "token": "email-verification-token" }
```

---

## Deals

### GET /deals
**Query params:** `page`, `pageSize`, `category`, `city`, `lat`, `lng`, `radius`, `minPrice`, `maxPrice`, `minDiscount`, `sort` (relevance|price_asc|price_desc|newest|popular), `featured`

```json
// Response 200
{
  "items": [{
    "id": "uuid",
    "title": "60-Min Massage at Serenity Spa",
    "slug": "60-min-massage-serenity-spa",
    "shortDescription": "Full-body relaxation massage",
    "originalPrice": 120.00,
    "discountedPrice": 49.00,
    "discountPercent": 59,
    "primaryImageUrl": "https://...",
    "vendor": { "id": "uuid", "name": "Serenity Spa", "city": "New York" },
    "category": { "id": 5, "name": "Health & Beauty" },
    "quantitySold": 243,
    "avgRating": 4.7,
    "reviewCount": 89,
    "expiresAt": "2025-12-31T23:59:59Z",
    "isFeatured": true
  }],
  "totalCount": 1240,
  "page": 1,
  "pageSize": 20,
  "totalPages": 62
}
```

### GET /deals/{slug}
```json
// Response 200
{
  "id": "uuid",
  "title": "...",
  "description": "<html>rich content</html>",
  "finePrint": "...",
  "highlights": ["WiFi included", "Free cancellation"],
  "options": [
    { "id": "uuid", "title": "1 Session", "price": 49.00, "availableQty": 57 },
    { "id": "uuid", "title": "3 Sessions", "price": 120.00, "availableQty": 23 }
  ],
  "images": [{ "url": "...", "altText": "...", "isPrimary": true }],
  "vendor": { "id": "uuid", "name": "...", "address": "...", "lat": 40.71, "lng": -74.01 },
  "voucherValidity": 90,
  "expiresAt": "...",
  "quantityTotal": 500,
  "quantitySold": 243
}
```

### GET /deals/featured
### GET /deals/trending
### GET /deals/expiring-soon

### POST /deals/{id}/view  *(increments view count)*

---

## Categories

### GET /categories
```json
[{ "id": 1, "name": "Local Deals", "slug": "local", "icon": "📍", "subcategories": [...] }]
```

---

## Orders & Cart

### POST /orders
```json
// Request
{
  "items": [
    { "dealId": "uuid", "dealOptionId": "uuid", "quantity": 2 }
  ],
  "promoCode": "SAVE20"
}

// Response 201
{
  "orderId": "uuid",
  "orderNumber": "DH-20250001",
  "subtotal": 98.00,
  "discountAmount": 19.60,
  "totalAmount": 78.40,
  "stripeClientSecret": "pi_xxx_secret_xxx"
}
```

### GET /orders
```json
// User's order history (paginated)
```

### GET /orders/{id}
```json
{
  "id": "uuid",
  "orderNumber": "DH-20250001",
  "status": "Paid",
  "items": [...],
  "vouchers": [{ "code": "DH-XXXX-YYYY", "qrCodeUrl": "...", "expiresAt": "..." }],
  "payment": { "amount": 78.40, "status": "Succeeded" },
  "createdAt": "..."
}
```

### POST /orders/{id}/cancel

---

## Payments

### POST /payments/create-intent
```json
// Request
{ "orderId": "uuid" }

// Response 200
{ "clientSecret": "pi_xxx_secret_xxx", "publishableKey": "pk_live_xxx" }
```

### POST /webhooks/stripe  *(Stripe webhook endpoint — no auth)*

### POST /payments/{orderId}/refund  *(Admin only)*
```json
{ "amount": 49.00, "reason": "Customer request" }
```

---

## Vouchers

### GET /vouchers
*User's vouchers (paginated)*

### GET /vouchers/{code}
```json
{
  "code": "DH-XXXX-YYYY",
  "dealTitle": "60-Min Massage",
  "vendorName": "Serenity Spa",
  "status": "Active",
  "issuedAt": "...",
  "expiresAt": "...",
  "qrCodeUrl": "..."
}
```

### POST /vouchers/{code}/redeem  *(Vendor only)*
```json
{ "vendorStaffId": "uuid" }
// Response 200: { "success": true, "message": "Voucher redeemed." }
// Response 422: { "error": "Voucher already redeemed | Expired | Invalid" }
```

---

## Reviews

### GET /deals/{dealId}/reviews
**Query:** `page`, `pageSize`, `sort` (newest|rating_high|rating_low)

### POST /deals/{dealId}/reviews
```json
// Request
{ "orderId": "uuid", "rating": 5, "title": "Amazing experience!", "body": "..." }
```

### PUT /reviews/{id}/vendor-reply  *(Vendor only)*
```json
{ "reply": "Thank you for your kind words!" }
```

### DELETE /reviews/{id}  *(Admin only)*

---

## Users (Profile)

### GET /users/me
### PUT /users/me
```json
{ "firstName": "Jane", "lastName": "Smith", "phoneNumber": "+1234567890" }
```

### PUT /users/me/password
```json
{ "currentPassword": "...", "newPassword": "..." }
```

### GET /users/me/wishlist
### POST /users/me/wishlist
```json
{ "dealId": "uuid" }
```
### DELETE /users/me/wishlist/{dealId}

### GET /users/me/notifications
### PUT /users/me/notifications/{id}/read
### PUT /users/me/notifications/read-all

---

## Vendors

### POST /vendors/register
```json
{
  "businessName": "Serenity Spa",
  "description": "...",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "phoneNumber": "+1..."
}
```

### GET /vendors/me/dashboard
```json
{
  "totalDeals": 12,
  "activeDeals": 8,
  "totalRevenue": 24500.00,
  "pendingPayout": 3200.00,
  "totalOrders": 340,
  "totalVouchers": 612,
  "redeemedVouchers": 489,
  "avgRating": 4.6
}
```

### GET /vendors/me/deals
### POST /vendors/me/deals
### PUT /vendors/me/deals/{id}
### DELETE /vendors/me/deals/{id}
### POST /vendors/me/deals/{id}/submit  *(submit for approval)*

### GET /vendors/me/vouchers  *(for redemption scanner)*
### GET /vendors/me/payouts

---

## Admin

### GET /admin/deals?status=PendingApproval
### PUT /admin/deals/{id}/approve
### PUT /admin/deals/{id}/reject
```json
{ "reason": "Images violate content policy." }
```

### GET /admin/vendors?status=Pending
### PUT /admin/vendors/{id}/approve
### PUT /admin/vendors/{id}/suspend
```json
{ "reason": "Multiple policy violations." }
```

### GET /admin/users
### PUT /admin/users/{id}/suspend
### DELETE /admin/users/{id}

### GET /admin/orders
### GET /admin/analytics/overview
```json
{
  "gmv": 1245000.00,
  "ordersToday": 342,
  "newUsersToday": 89,
  "activeDeals": 2340,
  "pendingApprovals": 12
}
```

### GET /admin/promo-codes
### POST /admin/promo-codes
### PUT /admin/promo-codes/{id}
### DELETE /admin/promo-codes/{id}

---

## Error Response Format
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "errors": {
    "email": ["Email is required.", "Invalid email format."],
    "password": ["Password must be at least 8 characters."]
  },
  "traceId": "00-abc123-def456-00"
}
```

---

## Standard HTTP Status Codes

| Code | Meaning                           |
|------|-----------------------------------|
| 200  | OK                                |
| 201  | Created                           |
| 204  | No Content                        |
| 400  | Bad Request                       |
| 401  | Unauthorized (missing/invalid JWT)|
| 403  | Forbidden (insufficient role)     |
| 404  | Not Found                         |
| 409  | Conflict (duplicate)              |
| 422  | Unprocessable (validation errors) |
| 429  | Too Many Requests (rate limited)  |
| 500  | Internal Server Error             |

---

*API Version: v1 | Auth: JWT Bearer | Rate Limit: 1000 req/min (auth)*
