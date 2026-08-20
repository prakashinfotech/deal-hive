namespace GrouponClone.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid DealId { get; private set; }

    public Deal Deal { get; private set; } = default!;

    protected WishlistItem() { }

    public static WishlistItem Create(Guid userId, Guid dealId)
    {
        return new WishlistItem { UserId = userId, DealId = dealId };
    }
}
