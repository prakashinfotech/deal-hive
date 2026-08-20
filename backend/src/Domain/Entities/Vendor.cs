using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Events;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class Vendor : BaseEntity
{
    public Guid UserId { get; private set; }
    public string BusinessName { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string? Description { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Website { get; private set; }
    public string AddressLine1 { get; private set; } = default!;
    public string? AddressLine2 { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? ZipCode { get; private set; }
    public string? PhoneNumber { get; private set; }
    public int? CategoryId { get; private set; }
    public VendorStatus Status { get; private set; } = VendorStatus.Pending;
    public string? StripeAccountId { get; private set; }
    public decimal AvgRating { get; private set; }
    public int ReviewCount { get; private set; }
    public int TotalDeals { get; private set; }

    // Navigation properties
    public Category? Category { get; private set; }
    private readonly List<Deal> _deals = [];
    public IReadOnlyCollection<Deal> Deals => _deals.AsReadOnly();

    protected Vendor() { }

    public static Vendor Create(
        Guid userId,
        string businessName,
        string slug,
        string addressLine1,
        string? description = null,
        string? phoneNumber = null,
        int? categoryId = null)
    {
        if (string.IsNullOrWhiteSpace(businessName)) throw new DomainException("Business name is required.");

        var vendor = new Vendor
        {
            UserId = userId,
            BusinessName = businessName.Trim(),
            Slug = slug.ToLowerInvariant(),
            Description = description?.Trim(),
            AddressLine1 = addressLine1.Trim(),
            PhoneNumber = phoneNumber,
            CategoryId = categoryId,
        };

        vendor.AddDomainEvent(new VendorRegisteredEvent(vendor.Id, userId));
        return vendor;
    }

    public void Approve()
    {
        if (Status != VendorStatus.Pending)
            throw new DomainException("Only pending vendors can be approved.");

        Status = VendorStatus.Active;
        SetUpdated();
        AddDomainEvent(new VendorApprovedEvent(Id));
    }

    public void Suspend(string reason)
    {
        if (Status == VendorStatus.Suspended)
            throw new DomainException("Vendor is already suspended.");

        Status = VendorStatus.Suspended;
        SetUpdated();
        AddDomainEvent(new VendorSuspendedEvent(Id, reason));
    }

    public void SetStripeAccount(string stripeAccountId)
    {
        StripeAccountId = stripeAccountId;
        SetUpdated();
    }

    public void UpdateProfile(string? description, string? logoUrl, string? website, string? phoneNumber)
    {
        Description = description?.Trim();
        LogoUrl = logoUrl;
        Website = website;
        PhoneNumber = phoneNumber;
        SetUpdated();
    }

    public void UpdateRating(decimal avgRating, int reviewCount)
    {
        AvgRating = avgRating;
        ReviewCount = reviewCount;
        SetUpdated();
    }

    public void IncrementDealCount() { TotalDeals++; SetUpdated(); }

    public bool IsActive => Status == VendorStatus.Active;
}
