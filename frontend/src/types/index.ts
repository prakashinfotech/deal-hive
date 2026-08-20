// ============================================================
// DealHive — Shared TypeScript Types
// src/types/index.ts
// ============================================================

// ─── Auth ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Consumer' | 'Vendor' | 'Admin' | 'SuperAdmin';
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Deals ───────────────────────────────────────────────────

export type DealType = 'Service' | 'Travel' | 'Goods' | 'Experience';
export type DealStatus = 'Draft' | 'PendingApproval' | 'Active' | 'Paused' | 'Expired' | 'Rejected';

export interface DealOption {
  id: string;
  title: string;
  description?: string;
  price: number;
  availableQty?: number;
}

export interface DealImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface DealSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  primaryImageUrl: string | null;
  // flat properties matching the API response shape
  vendorName: string;
  vendorCity: string;
  categoryName: string;
  categorySlug: string;
  avgRating: number;
  reviewCount: number;
  quantitySold: number;
  expiresAt?: string;
  isFeatured: boolean;
  type: DealType;
}

export interface DealDetail extends DealSummary {
  description: string;
  finePrint?: string;
  highlights: string[];
  options: DealOption[];
  images: DealImage[];
  quantityTotal?: number;
  quantityLimit?: number;
  voucherValidity: number;
  vendorId: string;
  status: DealStatus;
  startsAt: string;
}

// ─── Categories ──────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  subcategories?: Category[];
}

// ─── Orders ──────────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'Paid' | 'Fulfilled' | 'Cancelled' | 'Refunded';

export interface OrderItem {
  id: string;
  dealId: string;
  dealTitle: string;
  dealOptionId?: string;
  optionTitle?: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  vouchers: Voucher[];
  payment?: Payment;
  promoCode?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CreateOrderRequest {
  items: { dealId: string; dealOptionId?: string; quantity: number }[];
  promoCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  stripeClientSecret: string;
}

// ─── Payments ────────────────────────────────────────────────

export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Refunded' | 'PartiallyRefunded';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  refundedAmount: number;
  createdAt: string;
}

// ─── Vouchers ────────────────────────────────────────────────

export type VoucherStatus = 'Active' | 'Redeemed' | 'Expired' | 'Refunded';

export interface Voucher {
  id: string;
  code: string;
  qrCodeUrl?: string;
  dealId: string;
  dealTitle: string;
  vendorName: string;
  status: VoucherStatus;
  issuedAt: string;
  expiresAt: string;
  redeemedAt?: string;
}

// ─── Reviews ─────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  userFullName: string;
  userAvatarUrl?: string;
  rating: number;
  title?: string;
  body?: string;
  vendorReply?: string;
  vendorRepliedAt?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  title?: string;
  body?: string;
}

// ─── Vendor ──────────────────────────────────────────────────

export type VendorStatus = 'Pending' | 'Active' | 'Suspended' | 'Rejected';

export interface Vendor {
  id: string;
  businessName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  city?: string;
  state?: string;
  status: VendorStatus;
  avgRating: number;
  reviewCount: number;
  totalDeals: number;
}

export interface VendorDashboard {
  totalDeals: number;
  activeDeals: number;
  totalRevenue: number;
  pendingPayout: number;
  totalOrders: number;
  totalVouchers: number;
  redeemedVouchers: number;
  avgRating: number;
}

// ─── Pagination ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Common ──────────────────────────────────────────────────

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export interface DealsFilterParams {
  page?: number;
  pageSize?: number;
  category?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  featured?: boolean;
  search?: string;
}
