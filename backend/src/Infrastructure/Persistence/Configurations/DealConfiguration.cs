using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Infrastructure.Persistence.Configurations;

public class DealConfiguration : IEntityTypeConfiguration<Deal>
{
    public void Configure(EntityTypeBuilder<Deal> builder)
    {
        builder.ToTable("Deals");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Title).IsRequired().HasMaxLength(300);
        builder.Property(d => d.Slug).IsRequired().HasMaxLength(350);
        builder.Property(d => d.ShortDescription).IsRequired().HasMaxLength(500);
        builder.Property(d => d.Description).IsRequired().HasColumnType("text");
        builder.Property(d => d.FinePrint).HasColumnType("text");
        builder.Property(d => d.Highlights).HasColumnType("text");
        builder.Property(d => d.Currency).HasMaxLength(3).HasDefaultValue("USD");
        builder.Property(d => d.OriginalPrice).HasColumnType("decimal(18,2)");
        builder.Property(d => d.DiscountedPrice).HasColumnType("decimal(18,2)");
        builder.Property(d => d.AvgRating).HasColumnType("decimal(3,2)");

        builder.HasIndex(d => d.Slug).IsUnique();
        builder.HasIndex(d => d.Status);
        builder.HasIndex(d => d.VendorId);
        builder.HasIndex(d => d.CategoryId);
        builder.HasIndex(d => d.IsFeatured);
        builder.HasIndex(d => d.ExpiresAt);

        builder.HasQueryFilter(d => d.DeletedAt == null);

        builder.HasMany(d => d.Options)
            .WithOne(o => o.Deal)
            .HasForeignKey(o => o.DealId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(d => d.Images)
            .WithOne(i => i.Deal)
            .HasForeignKey(i => i.DealId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Vendor)
            .WithMany(v => v.Deals)
            .HasForeignKey(d => d.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Category)
            .WithMany()
            .HasForeignKey(d => d.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class DealOptionConfiguration : IEntityTypeConfiguration<DealOption>
{
    public void Configure(EntityTypeBuilder<DealOption> builder)
    {
        builder.ToTable("DealOptions");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Title).IsRequired().HasMaxLength(200);
        builder.Property(o => o.Description).HasMaxLength(500);
        builder.Property(o => o.Price).HasColumnType("decimal(18,2)");
        builder.HasIndex(o => o.DealId);
        builder.HasQueryFilter(o => o.DeletedAt == null);
    }
}

public class DealImageConfiguration : IEntityTypeConfiguration<DealImage>
{
    public void Configure(EntityTypeBuilder<DealImage> builder)
    {
        builder.ToTable("DealImages");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Url).IsRequired().HasMaxLength(2048);
        builder.Property(i => i.AltText).HasMaxLength(300);
        builder.HasIndex(i => i.DealId);
        builder.HasQueryFilter(i => i.DeletedAt == null);
    }
}
