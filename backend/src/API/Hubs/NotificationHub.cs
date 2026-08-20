using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GrouponClone.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");

        await base.OnDisconnectedAsync(exception);
    }
}

/// <summary>Service to push notifications to connected clients.</summary>
public interface INotificationPusher
{
    Task PushToUserAsync(Guid userId, string type, object payload, CancellationToken ct = default);
}

public class NotificationPusher : INotificationPusher
{
    private readonly IHubContext<NotificationHub> _hub;
    public NotificationPusher(IHubContext<NotificationHub> hub) => _hub = hub;

    public async Task PushToUserAsync(Guid userId, string type, object payload, CancellationToken ct = default)
        => await _hub.Clients.Group($"user-{userId}").SendAsync("notification", new { type, payload }, ct);
}
