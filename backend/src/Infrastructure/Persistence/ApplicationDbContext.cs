using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Events;
using GrouponClone.Infrastructure.Identity;

namespace GrouponClone.Infrastructure.Persistence;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IUnitOfWork, IApplicationDbContext
{
    private readonly IPublisher _publisher;
    private IDbContextTransaction? _currentTransaction;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IPublisher publisher)
        : base(options)
    {
        _publisher = publisher;
    }

    // ─── Domain DbSets ────────────────────────────────────────
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<DealOption> DealOptions => Set<DealOption>();
    public DbSet<DealImage> DealImages => Set<DealImage>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Identity table renames
        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var domainEvents = ChangeTracker.Entries<BaseEntity>()
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        var result = await base.SaveChangesAsync(cancellationToken);

        foreach (var ev in domainEvents)
        {
            if (ev is INotification notification)
                await _publisher.Publish(notification, cancellationToken);
        }

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            entry.Entity.ClearDomainEvents();

        return result;
    }

    // ─── IUnitOfWork ─────────────────────────────────────────
    async Task<int> IUnitOfWork.SaveChangesAsync(CancellationToken ct) => await SaveChangesAsync(ct);

    public async Task BeginTransactionAsync(CancellationToken ct = default)
    {
        _currentTransaction = await Database.BeginTransactionAsync(ct);
    }

    public async Task CommitTransactionAsync(CancellationToken ct = default)
    {
        if (_currentTransaction is null) return;
        await _currentTransaction.CommitAsync(ct);
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken ct = default)
    {
        if (_currentTransaction is null) return;
        await _currentTransaction.RollbackAsync(ct);
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
    }
}
