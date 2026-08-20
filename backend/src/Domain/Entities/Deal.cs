// ============================================================
// GrouponClone.Domain — Deal Aggregate Root
// Domain/Entities/Deal.cs
// ============================================================

using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Events;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

/// <summary>Deal aggregate root.</summary>
public class Deal : BaseEntity
{
    public Guid VendorId { get; private set; }
    public int CategoryId { get; private set; }
    public string Title { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string ShortDescription { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public string? FinePrint { get; private set; }
    public string? Highlights { get; private set; } // JSON array
    public DealType Type { get; private set; }
    public decimal OriginalPrice { get; private set; }
    public decimal DiscountedPrice { get; private set; }
    public string Currency { get; private set; } = "USD";
    public int? QuantityTotal { get; private set; }
    public int QuantitySold { get; private set; }
    public int? QuantityLimit { get; private set; }
    public int VoucherValidity { get; private set; } = 90;
    public DateTime StartsAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public DealStatus Status { get; private set; } = DealStatus.Draft;
    public bool IsFeatured { get; private set; }
    public DateTime? FeaturedUntil { get; private set; }
    public int ViewCount { get; private set; }
    public decimal AvgRating { get; private set; }
    public int ReviewCount { get; private set; }

    // Navigation properties
    public Vendor Vendor { get; private set; } = default!;
    public Category Category { get; private set; } = default!;
    private readonly List<DealOption> _options = [];
    private readonly List<DealImage> _images = [];
    public IReadOnlyCollection<DealOption> Options => _options.AsReadOnly();
    public IReadOnlyCollection<DealImage> Images => _images.AsReadOnly();

    protected Deal() { } // EF Core

    public static Deal Create(
        Guid vendorId,
        int categoryId,
        string title,
        string slug,
        string shortDescription,
        string description,
        DealType type,
        decimal originalPrice,
        decimal discountedPrice,
        DateTime startsAt,
        DateTime? expiresAt = null,
        int? quantityTotal = null,
        int? quantityLimit = null,
        int voucherValidity = 90,
        string? finePrint = null)
    {
        if (originalPrice <= 0) throw new DomainException("Original price must be greater than zero.");
        if (discountedPrice <= 0) throw new DomainException("Discounted price must be greater than zero.");
        if (discountedPrice >= originalPrice) throw new DomainException("Discounted price must be less than original price.");
        if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Deal title is required.");

        var deal = new Deal
        {
            VendorId = vendorId,
            CategoryId = categoryId,
            Title = title.Trim(),
            Slug = slug.ToLowerInvariant(),
            ShortDescription = shortDescription.Trim(),
            Description = description,
            FinePrint = finePrint?.Trim(),
            Type = type,
            OriginalPrice = originalPrice,
            DiscountedPrice = discountedPrice,
            StartsAt = startsAt,
            ExpiresAt = expiresAt,
            QuantityTotal = quantityTotal,
            QuantityLimit = quantityLimit,
            VoucherValidity = voucherValidity,
        };

        deal.AddDomainEvent(new DealCreatedEvent(deal.Id, vendorId));
        return deal;
    }

    public void Update(
        string title, string shortDescription, string description,
        string? finePrint, decimal originalPrice, decimal discountedPrice,
        DateTime startsAt, DateTime? expiresAt, int? quantityTotal,
        int? quantityLimit, int voucherValidity, int categoryId)
    {
        if (Status != DealStatus.Draft && Status != DealStatus.Rejected)
            throw new DomainException("Only Draft or Rejected deals can be edited.");
        if (originalPrice <= 0) throw new DomainException("Original price must be greater than zero.");
        if (discountedPrice <= 0) throw new DomainException("Discounted price must be greater than zero.");
        if (discountedPrice >= originalPrice) throw new DomainException("Discounted price must be less than original price.");

        Title = title.Trim();
        ShortDescription = shortDescription.Trim();
        Description = description;
        FinePrint = finePrint?.Trim();
        OriginalPrice = originalPrice;
        DiscountedPrice = discountedPrice;
        StartsAt = startsAt;
        ExpiresAt = expiresAt;
        QuantityTotal = quantityTotal;
        QuantityLimit = quantityLimit;
        VoucherValidity = voucherValidity;
        CategoryId = categoryId;
        SetUpdated();
    }

    public void SubmitForApproval()
    {
        if (Status != DealStatus.Draft)
            throw new DomainException("Only draft deals can be submitted for approval.");

        Status = DealStatus.PendingApproval;
        SetUpdated();
        AddDomainEvent(new DealSubmittedForApprovalEvent(Id, VendorId));
    }

    public void Approve()
    {
        if (Status != DealStatus.PendingApproval)
            throw new DomainException("Only pending deals can be approved.");

        Status = DealStatus.Active;
        SetUpdated();
        AddDomainEvent(new DealApprovedEvent(Id, VendorId));
    }

    public void Reject(string reason)
    {
        if (Status != DealStatus.PendingApproval)
            throw new DomainException("Only pending deals can be rejected.");

        Status = DealStatus.Rejected;
        SetUpdated();
        AddDomainEvent(new DealRejectedEvent(Id, VendorId, reason));
    }

    public void Pause()
    {
        if (Status != DealStatus.Active)
            throw new DomainException("Only active deals can be paused.");

        Status = DealStatus.Paused;
        SetUpdated();
    }

    public void Resume()
    {
        if (Status != DealStatus.Paused)
            throw new DomainException("Only paused deals can be resumed.");

        Status = DealStatus.Active;
        SetUpdated();
    }

    public void IncrementSold(int quantity = 1)
    {
        if (QuantityTotal.HasValue && QuantitySold + quantity > QuantityTotal.Value)
            throw new DomainException("Insufficient deal quantity.");

        QuantitySold += quantity;
        SetUpdated();
    }

    public void IncrementViews() => ViewCount++;

    public void SetFeatured(DateTime? until = null)
    {
        IsFeatured = true;
        FeaturedUntil = until;
        SetUpdated();
    }

    public void UpdateRating(decimal avgRating, int reviewCount)
    {
        AvgRating = avgRating;
        ReviewCount = reviewCount;
        SetUpdated();
    }

    public decimal GetDiscountPercent() =>
        OriginalPrice > 0 ? Math.Round((1 - DiscountedPrice / OriginalPrice) * 100, 1) : 0;

    public bool IsAvailable() =>
        Status == DealStatus.Active &&
        (ExpiresAt == null || ExpiresAt > DateTime.UtcNow) &&
        (QuantityTotal == null || QuantitySold < QuantityTotal);
}
