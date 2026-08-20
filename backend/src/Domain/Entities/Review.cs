using GrouponClone.Domain.Events;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class Review : BaseEntity
{
    public Guid DealId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid OrderId { get; private set; }
    public string UserFullName { get; private set; } = default!;
    public string? UserAvatarUrl { get; private set; }
    public int Rating { get; private set; }
    public string? Title { get; private set; }
    public string? Body { get; private set; }
    public string? VendorReply { get; private set; }
    public DateTime? VendorRepliedAt { get; private set; }
    public bool IsVerified { get; private set; } = true;

    protected Review() { }

    public static Review Create(Guid dealId, Guid userId, Guid orderId, string userFullName,
        int rating, string? title = null, string? body = null, string? avatarUrl = null)
    {
        if (rating < 1 || rating > 5) throw new DomainException("Rating must be between 1 and 5.");

        var review = new Review
        {
            DealId = dealId,
            UserId = userId,
            OrderId = orderId,
            UserFullName = userFullName,
            UserAvatarUrl = avatarUrl,
            Rating = rating,
            Title = title?.Trim(),
            Body = body?.Trim(),
        };
        review.AddDomainEvent(new ReviewPostedEvent(review.Id, dealId, userId, rating));
        return review;
    }

    public void AddVendorReply(string reply)
    {
        if (string.IsNullOrWhiteSpace(reply)) throw new DomainException("Reply cannot be empty.");
        VendorReply = reply.Trim();
        VendorRepliedAt = DateTime.UtcNow;
        SetUpdated();
    }
}
