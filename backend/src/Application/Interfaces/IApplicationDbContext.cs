using Microsoft.EntityFrameworkCore;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Application.Interfaces;

/// <summary>
/// Abstraction over ApplicationDbContext that keeps the Application layer
/// decoupled from the Infrastructure layer. ApplicationDbContext implements this.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Deal>         Deals        { get; }
    DbSet<Vendor>       Vendors      { get; }
    DbSet<Category>     Categories   { get; }
    DbSet<Order>        Orders       { get; }
    DbSet<OrderItem>    OrderItems   { get; }
    DbSet<Voucher>      Vouchers     { get; }
    DbSet<Payment>      Payments     { get; }
    DbSet<Review>       Reviews      { get; }
    DbSet<PromoCode>    PromoCodes   { get; }
    DbSet<Notification> Notifications{ get; }
    DbSet<WishlistItem> WishlistItems{ get; }
    DbSet<DealOption>   DealOptions  { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
