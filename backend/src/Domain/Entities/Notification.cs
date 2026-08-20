namespace GrouponClone.Domain.Entities;

public enum NotificationType { OrderConfirmed, VoucherIssued, DealApproved, DealRejected, ReviewReceived, PayoutProcessed }

public class Notification : BaseEntity
{
    public Guid UserId { get; private set; }
    public NotificationType Type { get; private set; }
    public string Title { get; private set; } = default!;
    public string Message { get; private set; } = default!;
    public string? ActionUrl { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }

    protected Notification() { }

    public static Notification Create(Guid userId, NotificationType type, string title, string message, string? actionUrl = null)
    {
        return new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            ActionUrl = actionUrl,
        };
    }

    public void MarkRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
            SetUpdated();
        }
    }
}
