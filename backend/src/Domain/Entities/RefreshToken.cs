namespace GrouponClone.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Token { get; private set; } = default!;
    public Guid FamilyId { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public Guid? ReplacedById { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsActive => !IsRevoked && !IsExpired;

    protected RefreshToken() { }

    public static RefreshToken Create(Guid userId, string token, int expiryDays = 7)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = token,
            FamilyId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
        };
    }

    public static RefreshToken Rotate(RefreshToken previous, string newToken, int expiryDays = 7)
    {
        var next = new RefreshToken
        {
            UserId = previous.UserId,
            Token = newToken,
            FamilyId = previous.FamilyId,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
        };
        previous.ReplacedById = next.Id;
        previous.RevokedAt = DateTime.UtcNow;
        return next;
    }

    public void Revoke() { RevokedAt = DateTime.UtcNow; SetUpdated(); }
}
