using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TaxAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Currency).HasMaxLength(3).HasDefaultValue("USD");
        builder.Property(o => o.PromoCode).HasMaxLength(50);
        builder.Property(o => o.StripePaymentIntentId).HasMaxLength(200);

        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);

        builder.HasQueryFilter(o => o.DeletedAt == null);

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Vouchers)
            .WithOne()
            .HasForeignKey(v => v.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.DealTitle).IsRequired().HasMaxLength(300);
        builder.Property(i => i.OptionTitle).HasMaxLength(200);
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Ignore(i => i.TotalPrice);
        builder.HasIndex(i => i.OrderId);
        builder.HasIndex(i => i.DealId);
        builder.HasQueryFilter(i => i.DeletedAt == null);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.StripePaymentIntentId).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.RefundedAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Currency).HasMaxLength(3).HasDefaultValue("USD");
        builder.Property(p => p.FailureReason).HasMaxLength(500);
        builder.HasIndex(p => p.StripePaymentIntentId).IsUnique();
        builder.HasIndex(p => p.OrderId);
        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}
