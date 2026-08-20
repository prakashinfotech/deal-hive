using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; private set; }
    public string StripePaymentIntentId { get; private set; } = default!;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public decimal RefundedAmount { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTime? SucceededAt { get; private set; }

    public Order Order { get; private set; } = default!;

    protected Payment() { }

    public static Payment Create(Guid orderId, string paymentIntentId, decimal amount, string currency = "USD")
    {
        return new Payment
        {
            OrderId = orderId,
            StripePaymentIntentId = paymentIntentId,
            Amount = amount,
            Currency = currency,
        };
    }

    public void MarkSucceeded()
    {
        Status = PaymentStatus.Succeeded;
        SucceededAt = DateTime.UtcNow;
        SetUpdated();
    }

    public void MarkFailed(string? reason = null)
    {
        Status = PaymentStatus.Failed;
        FailureReason = reason;
        SetUpdated();
    }

    public void AddRefund(decimal amount)
    {
        if (amount <= 0) throw new DomainException("Refund amount must be positive.");
        if (RefundedAmount + amount > Amount) throw new DomainException("Refund exceeds payment amount.");

        RefundedAmount += amount;
        Status = RefundedAmount >= Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
        SetUpdated();
    }
}
