using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Enums;
using GrouponClone.Infrastructure.Persistence;

namespace GrouponClone.Infrastructure.Persistence.Repositories;

public class DealRepository : BaseRepository<Deal>, IDealRepository
{
    public DealRepository(ApplicationDbContext db) : base(db) { }

    public async Task<Deal?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await DbSet
            .Include(d => d.Options.Where(o => o.IsActive))
            .Include(d => d.Images.OrderBy(i => i.SortOrder))
            .Include(d => d.Vendor)
            .Include(d => d.Category)
            .FirstOrDefaultAsync(d => d.Slug == slug, ct);

    public async Task<(IEnumerable<Deal> Items, int TotalCount)> GetPagedAsync(
        DealsFilter filter, CancellationToken ct = default)
    {
        var query = DbSet
            .AsNoTracking()
            .Include(d => d.Vendor)
            .Include(d => d.Category)
            .Include(d => d.Images.Where(i => i.IsPrimary).Take(1))
            .Where(d => d.Status == DealStatus.Active);

        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(d => d.Category.Slug == filter.Category);

        if (!string.IsNullOrWhiteSpace(filter.City))
            query = query.Where(d => d.Vendor.City.ToLower() == filter.City.ToLower());

        if (filter.MinPrice.HasValue)
            query = query.Where(d => d.DiscountedPrice >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(d => d.DiscountedPrice <= filter.MaxPrice.Value);

        if (filter.MinDiscount.HasValue)
            query = query.Where(d =>
                ((d.OriginalPrice - d.DiscountedPrice) / d.OriginalPrice * 100) >= filter.MinDiscount.Value);

        if (filter.Featured == true)
            query = query.Where(d => d.IsFeatured);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(d =>
                d.Title.ToLower().Contains(search) ||
                d.ShortDescription.ToLower().Contains(search) ||
                d.Vendor.BusinessName.ToLower().Contains(search));
        }

        query = filter.Sort switch
        {
            "price_asc" => query.OrderBy(d => d.DiscountedPrice),
            "price_desc" => query.OrderByDescending(d => d.DiscountedPrice),
            "newest" => query.OrderByDescending(d => d.CreatedAt),
            "popular" => query.OrderByDescending(d => d.QuantitySold),
            _ => query.OrderByDescending(d => d.IsFeatured).ThenByDescending(d => d.QuantitySold)
        };

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<IEnumerable<Deal>> GetFeaturedAsync(int count = 10, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(d => d.Vendor)
            .Include(d => d.Category)
            .Include(d => d.Images.Where(i => i.IsPrimary).Take(1))
            .Where(d => d.Status == DealStatus.Active && d.IsFeatured &&
                        (d.FeaturedUntil == null || d.FeaturedUntil > DateTime.UtcNow))
            .OrderByDescending(d => d.QuantitySold)
            .Take(count)
            .ToListAsync(ct);

    public async Task<IEnumerable<Deal>> GetTrendingAsync(int count = 10, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(d => d.Vendor)
            .Include(d => d.Category)
            .Include(d => d.Images.Where(i => i.IsPrimary).Take(1))
            .Where(d => d.Status == DealStatus.Active)
            .OrderByDescending(d => d.ViewCount)
            .Take(count)
            .ToListAsync(ct);

    public async Task<IEnumerable<Deal>> GetExpiringSoonAsync(int hours = 24, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.AddHours(hours);
        return await DbSet.AsNoTracking()
            .Include(d => d.Vendor)
            .Include(d => d.Category)
            .Include(d => d.Images.Where(i => i.IsPrimary).Take(1))
            .Where(d => d.Status == DealStatus.Active && d.ExpiresAt != null && d.ExpiresAt <= cutoff)
            .OrderBy(d => d.ExpiresAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Deal>> GetByVendorAsync(Guid vendorId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(d => d.Images.Where(i => i.IsPrimary).Take(1))
            .Where(d => d.VendorId == vendorId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);

    public async Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default)
        => await DbSet.AnyAsync(d => d.Slug == slug, ct);
}
