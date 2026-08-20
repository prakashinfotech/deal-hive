using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Events;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class Voucher : BaseEntity
{
    public string Code { get; private set; } = default!;
    public Guid OrderId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid DealId { get; private set; }
    public string DealTitle { get; private set; } = default!;
    public Guid VendorId { get; private set; }
    public string VendorName { get; private set; } = default!;
    public VoucherStatus Status { get; private set; } = VoucherStatus.Active;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RedeemedAt { get; private set; }
    public Guid? RedeemedByStaffId { get; private set; }
    public string? QrCodeUrl { get; private set; }

    protected Voucher() { }

    public static Voucher Create(string code, Guid orderId, Guid userId, Guid dealId,
        string dealTitle, Guid vendorId, string vendorName, int validityDays)
    {
        var voucher = new Voucher
        {
            Code = code.ToUpperInvariant(),
            OrderId = orderId,
            UserId = userId,
            DealId = dealId,
            DealTitle = dealTitle,
            VendorId = vendorId,
            VendorName = vendorName,
            ExpiresAt = DateTime.UtcNow.AddDays(validityDays),
        };
        voucher.AddDomainEvent(new VoucherIssuedEvent(voucher.Id, userId, dealId, code));
        return voucher;
    }

    public void Redeem(Guid staffId)
    {
        if (Status == VoucherStatus.Redeemed) throw new DomainException("Voucher has already been redeemed.");
        if (Status == VoucherStatus.Expired || ExpiresAt < DateTime.UtcNow) throw new DomainException("Voucher has expired.");
        if (Status == VoucherStatus.Refunded) throw new DomainException("Voucher has been refunded.");

        Status = VoucherStatus.Redeemed;
        RedeemedAt = DateTime.UtcNow;
        RedeemedByStaffId = staffId;
        SetUpdated();
        AddDomainEvent(new VoucherRedeemedEvent(Id, VendorId, RedeemedAt.Value));
    }

    public void Expire()
    {
        if (Status == VoucherStatus.Active)
        {
            Status = VoucherStatus.Expired;
            SetUpdated();
        }
    }

    public void Refund()
    {
        if (Status == VoucherStatus.Redeemed) throw new DomainException("Cannot refund a redeemed voucher.");
        Status = VoucherStatus.Refunded;
        SetUpdated();
    }

    public void SetQrCodeUrl(string url) { QrCodeUrl = url; SetUpdated(); }
}
