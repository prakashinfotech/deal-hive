using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public enum DiscountType { Percentage, FixedAmount }

public class PromoCode : BaseEntity
{
    public string Code { get; private set; } = default!;
    public DiscountType DiscountType { get; private set; }
    public decimal DiscountValue { get; private set; }
    public decimal? MinOrderAmount { get; private set; }
    public decimal? MaxDiscountAmount { get; private set; }
    public int? UsageLimit { get; private set; }
    public int UsageCount { get; private set; }
    public DateTime ValidFrom { get; private set; }
    public DateTime ValidUntil { get; private set; }
    public bool IsActive { get; private set; } = true;

    protected PromoCode() { }

    public static PromoCode Create(string code, DiscountType type, decimal value,
        DateTime validFrom, DateTime validUntil, decimal? minOrder = null,
        decimal? maxDiscount = null, int? usageLimit = null)
    {
        if (value <= 0) throw new DomainException("Discount value must be positive.");
        if (type == DiscountType.Percentage && value > 100) throw new DomainException("Percentage discount cannot exceed 100.");
        if (validUntil <= validFrom) throw new DomainException("ValidUntil must be after ValidFrom.");

        return new PromoCode
        {
            Code = code.ToUpperInvariant().Trim(),
            DiscountType = type,
            DiscountValue = value,
            MinOrderAmount = minOrder,
            MaxDiscountAmount = maxDiscount,
            UsageLimit = usageLimit,
            ValidFrom = validFrom,
            ValidUntil = validUntil,
        };
    }

    public decimal CalculateDiscount(decimal orderAmount)
    {
        if (!IsValid(orderAmount)) throw new DomainException("Promo code is not applicable.");

        var discount = DiscountType == DiscountType.Percentage
            ? orderAmount * (DiscountValue / 100)
            : DiscountValue;

        if (MaxDiscountAmount.HasValue && discount > MaxDiscountAmount.Value)
            discount = MaxDiscountAmount.Value;

        return Math.Min(discount, orderAmount);
    }

    public bool IsValid(decimal orderAmount)
    {
        var now = DateTime.UtcNow;
        return IsActive
            && now >= ValidFrom
            && now <= ValidUntil
            && (UsageLimit == null || UsageCount < UsageLimit)
            && (MinOrderAmount == null || orderAmount >= MinOrderAmount);
    }

    public void IncrementUsage() { UsageCount++; SetUpdated(); }
    public void Deactivate() { IsActive = false; SetUpdated(); }
}
