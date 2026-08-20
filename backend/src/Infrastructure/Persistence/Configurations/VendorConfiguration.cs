using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Infrastructure.Persistence.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.BusinessName).IsRequired().HasMaxLength(200);
        builder.Property(v => v.Slug).IsRequired().HasMaxLength(250);
        builder.Property(v => v.Description).HasColumnType("text");
        builder.Property(v => v.LogoUrl).HasMaxLength(2048);
        builder.Property(v => v.Website).HasMaxLength(500);
        builder.Property(v => v.AddressLine1).IsRequired().HasMaxLength(200);
        builder.Property(v => v.AddressLine2).HasMaxLength(200);
        builder.Property(v => v.City).HasMaxLength(100);
        builder.Property(v => v.State).HasMaxLength(100);
        builder.Property(v => v.ZipCode).HasMaxLength(20);
        builder.Property(v => v.PhoneNumber).HasMaxLength(30);
        builder.Property(v => v.CategoryId);
        builder.Property(v => v.StripeAccountId).HasMaxLength(100);
        builder.Property(v => v.AvgRating).HasColumnType("decimal(3,2)");

        builder.HasOne(v => v.Category)
            .WithMany()
            .HasForeignKey(v => v.CategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(v => v.Slug).IsUnique();
        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.Status);
        builder.HasIndex(v => v.CategoryId);

        builder.HasQueryFilter(v => v.DeletedAt == null);
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(120);
        builder.Property(c => c.Icon).HasMaxLength(10);
        builder.Property(c => c.ImageUrl).HasMaxLength(2048);

        builder.HasIndex(c => c.Slug).IsUnique();

        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Subcategories)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
