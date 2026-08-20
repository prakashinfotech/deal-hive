namespace GrouponClone.Domain.Entities;

public class DealImage : BaseEntity
{
    public Guid DealId { get; private set; }
    public string Url { get; private set; } = default!;
    public string? AltText { get; private set; }
    public bool IsPrimary { get; private set; }
    public int SortOrder { get; private set; }

    public Deal Deal { get; private set; } = default!;

    protected DealImage() { }

    public static DealImage Create(Guid dealId, string url, bool isPrimary = false, string? altText = null, int sortOrder = 0)
    {
        return new DealImage
        {
            DealId = dealId,
            Url = url,
            AltText = altText,
            IsPrimary = isPrimary,
            SortOrder = sortOrder,
        };
    }

    public void SetPrimary() { IsPrimary = true; SetUpdated(); }
}
