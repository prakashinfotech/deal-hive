using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class DealOption : BaseEntity
{
    public Guid DealId { get; private set; }
    public string Title { get; private set; } = default!;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int? AvailableQty { get; private set; }
    public int SoldQty { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    public Deal Deal { get; private set; } = default!;

    protected DealOption() { }

    public static DealOption Create(Guid dealId, string title, decimal price, string? description = null, int? availableQty = null, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Option title is required.");
        if (price <= 0) throw new DomainException("Option price must be greater than zero.");

        return new DealOption
        {
            DealId = dealId,
            Title = title.Trim(),
            Description = description?.Trim(),
            Price = price,
            AvailableQty = availableQty,
            SortOrder = sortOrder,
        };
    }

    public void DecrementQty(int qty = 1)
    {
        if (AvailableQty.HasValue && SoldQty + qty > AvailableQty.Value)
            throw new DomainException("Insufficient option quantity.");
        SoldQty += qty;
        SetUpdated();
    }

    public bool HasStock => AvailableQty == null || (AvailableQty - SoldQty) > 0;
}
