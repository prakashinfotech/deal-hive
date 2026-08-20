// ============================================================
// GrouponClone.Domain — Domain Events
// ============================================================

namespace GrouponClone.Domain.Events;

public interface IDomainEvent
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}

public abstract record DomainEventBase : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}

// ─── Deal Events ─────────────────────────────────────────────
public record DealCreatedEvent(Guid DealId, Guid VendorId) : DomainEventBase;
public record DealSubmittedForApprovalEvent(Guid DealId, Guid VendorId) : DomainEventBase;
public record DealApprovedEvent(Guid DealId, Guid VendorId) : DomainEventBase;
public record DealRejectedEvent(Guid DealId, Guid VendorId, string Reason) : DomainEventBase;

// ─── Order Events ─────────────────────────────────────────────
public record OrderCreatedEvent(Guid OrderId, Guid UserId, decimal Amount) : DomainEventBase;
public record OrderPaidEvent(Guid OrderId, Guid UserId, string PaymentIntentId) : DomainEventBase;
public record OrderCancelledEvent(Guid OrderId, Guid UserId) : DomainEventBase;

// ─── Voucher Events ──────────────────────────────────────────
public record VoucherIssuedEvent(Guid VoucherId, Guid UserId, Guid DealId, string Code) : DomainEventBase;
public record VoucherRedeemedEvent(Guid VoucherId, Guid VendorId, DateTime RedeemedAt) : DomainEventBase;

// ─── Vendor Events ───────────────────────────────────────────
public record VendorRegisteredEvent(Guid VendorId, Guid UserId) : DomainEventBase;
public record VendorApprovedEvent(Guid VendorId) : DomainEventBase;
public record VendorSuspendedEvent(Guid VendorId, string Reason) : DomainEventBase;

// ─── Review Events ───────────────────────────────────────────
public record ReviewPostedEvent(Guid ReviewId, Guid DealId, Guid UserId, int Rating) : DomainEventBase;
