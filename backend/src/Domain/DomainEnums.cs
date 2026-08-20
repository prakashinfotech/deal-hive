// ============================================================
// GrouponClone.Domain — Enums
// ============================================================

namespace GrouponClone.Domain.Enums;

public enum DealType { Service, Travel, Goods, Experience }
public enum DealStatus { Draft, PendingApproval, Active, Paused, Expired, Rejected }
public enum OrderStatus { Pending, Paid, Fulfilled, Cancelled, Refunded }
public enum VoucherStatus { Active, Redeemed, Expired, Refunded }
public enum PaymentStatus { Pending, Succeeded, Failed, Refunded, PartiallyRefunded }
public enum VendorStatus { Pending, Active, Suspended, Rejected }
public enum UserRole { Consumer, Vendor, Admin, SuperAdmin }
