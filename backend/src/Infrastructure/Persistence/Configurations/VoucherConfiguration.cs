using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Infrastructure.Persistence.Configurations;

public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
{
    public void Configure(EntityTypeBuilder<Voucher> builder)
    {
        builder.ToTable("Vouchers");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Code).IsRequired().HasMaxLength(30);
        builder.Property(v => v.DealTitle).IsRequired().HasMaxLength(300);
        builder.Property(v => v.VendorName).IsRequired().HasMaxLength(200);
        builder.Property(v => v.QrCodeUrl).HasMaxLength(2048);

        builder.HasIndex(v => v.Code).IsUnique();
        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.OrderId);
        builder.HasIndex(v => v.DealId);
        builder.HasIndex(v => v.VendorId);
        builder.HasIndex(v => v.Status);
        builder.HasIndex(v => v.ExpiresAt);

        builder.HasQueryFilter(v => v.DeletedAt == null);
    }
}

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserFullName).IsRequired().HasMaxLength(200);
        builder.Property(r => r.UserAvatarUrl).HasMaxLength(2048);
        builder.Property(r => r.Title).HasMaxLength(200);
        builder.Property(r => r.Body).HasColumnType("text");
        builder.Property(r => r.VendorReply).HasColumnType("text");

        builder.HasIndex(r => r.DealId);
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => new { r.UserId, r.OrderId }).IsUnique();

        builder.HasQueryFilter(r => r.DeletedAt == null);
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Token).IsRequired().HasMaxLength(200);
        builder.HasIndex(r => r.Token).IsUnique();
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.FamilyId);
        builder.HasQueryFilter(r => r.DeletedAt == null);
    }
}

public class PromotionCodeConfiguration : IEntityTypeConfiguration<PromoCode>
{
    public void Configure(EntityTypeBuilder<PromoCode> builder)
    {
        builder.ToTable("PromoCodes");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.DiscountValue).HasColumnType("decimal(18,2)");
        builder.Property(p => p.MinOrderAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.MaxDiscountAmount).HasColumnType("decimal(18,2)");
        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(1000);
        builder.Property(n => n.ActionUrl).HasMaxLength(500);
        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => new { n.UserId, n.IsRead });
        builder.HasQueryFilter(n => n.DeletedAt == null);
    }
}

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");
        builder.HasKey(w => w.Id);
        builder.HasIndex(w => new { w.UserId, w.DealId }).IsUnique();
        builder.HasOne(w => w.Deal).WithMany().HasForeignKey(w => w.DealId).OnDelete(DeleteBehavior.Cascade);
        builder.HasQueryFilter(w => w.DeletedAt == null);
    }
}
