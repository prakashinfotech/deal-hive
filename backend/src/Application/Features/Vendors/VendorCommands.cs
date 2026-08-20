using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Vendors;

// ─── Register Vendor ─────────────────────────────────────────

public record RegisterVendorCommand(
    string BusinessName, string? Description,
    string AddressLine1, string? AddressLine2,
    string? PhoneNumber, string? Website,
    int? CategoryId
) : IRequest<RegisterVendorResponse>;

public record RegisterVendorResponse(Guid VendorId, string BusinessName, string Slug);

public class RegisterVendorCommandHandler : IRequestHandler<RegisterVendorCommand, RegisterVendorResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;
    private readonly IIdentityService _identity;

    public RegisterVendorCommandHandler(ICurrentUserService cu, IUnitOfWork uow, IApplicationDbContext db, IIdentityService identity)
    {
        _currentUser = cu; _uow = uow; _db = db; _identity = identity;
    }

    public async Task<RegisterVendorResponse> Handle(RegisterVendorCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        if (await _db.Vendors.AnyAsync(v => v.UserId == userId, ct))
            throw new ConflictException("A vendor profile already exists for this account.");

        var slug = GenerateSlug(req.BusinessName);
        var existing = await _db.Vendors.AnyAsync(v => v.Slug == slug, ct);
        if (existing) slug = $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";

        var vendor = Vendor.Create(userId, req.BusinessName, slug, req.AddressLine1,
            req.Description, req.PhoneNumber, req.CategoryId);

        await _db.Vendors.AddAsync(vendor, ct);
        await _uow.SaveChangesAsync(ct);

        // Elevate user role to Vendor so they can access vendor-only endpoints
        await _identity.AssignRoleAsync(userId, Domain.Enums.UserRole.Vendor);

        return new RegisterVendorResponse(vendor.Id, vendor.BusinessName, vendor.Slug);
    }

    private static string GenerateSlug(string name) =>
        System.Text.RegularExpressions.Regex
            .Replace(name.ToLowerInvariant().Trim(), @"[^a-z0-9\s-]", "")
            .Replace(" ", "-").Trim('-');
}

// ─── Get Vendor Dashboard ─────────────────────────────────────

public record GetVendorDashboardQuery : IRequest<VendorDashboardResponse>;

public record VendorDashboardResponse(
    int TotalDeals, int ActiveDeals, decimal TotalRevenue,
    decimal PendingPayout, int TotalOrders, int TotalVouchers,
    int RedeemedVouchers, decimal AvgRating);

public class GetVendorDashboardQueryHandler : IRequestHandler<GetVendorDashboardQuery, VendorDashboardResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public GetVendorDashboardQueryHandler(ICurrentUserService cu, IApplicationDbContext db)
    {
        _currentUser = cu; _db = db;
    }

    public async Task<VendorDashboardResponse> Handle(GetVendorDashboardQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        var deals = await _db.Deals.AsNoTracking()
            .Where(d => d.VendorId == vendor.Id).ToListAsync(ct);

        var activeDeals = deals.Count(d => d.Status == Domain.Enums.DealStatus.Active);

        var orderItems = await _db.OrderItems.AsNoTracking()
            .Where(oi => oi.VendorId == vendor.Id)
            .Join(_db.Orders.AsNoTracking().Where(o => o.Status == Domain.Enums.OrderStatus.Paid || o.Status == Domain.Enums.OrderStatus.Fulfilled),
                oi => oi.OrderId, o => o.Id, (oi, o) => oi)
            .ToListAsync(ct);

        var revenue = orderItems.Sum(i => i.TotalPrice);
        var vouchers = await _db.Vouchers.AsNoTracking().Where(v => v.VendorId == vendor.Id).ToListAsync(ct);

        return new VendorDashboardResponse(
            deals.Count, activeDeals, revenue, revenue * 0.1m,
            orderItems.Select(i => i.OrderId).Distinct().Count(),
            vouchers.Count, vouchers.Count(v => v.Status == Domain.Enums.VoucherStatus.Redeemed),
            vendor.AvgRating);
    }
}

// ─── Get Vendor Deals ─────────────────────────────────────────

public record GetVendorDealsQuery : IRequest<IEnumerable<VendorDealDto>>;
public record VendorDealDto(Guid Id, string Title, string Slug, string Status, decimal OriginalPrice, decimal DiscountedPrice, int QuantitySold, int? QuantityTotal, decimal AvgRating, string CreatedAt);

public class GetVendorDealsQueryHandler : IRequestHandler<GetVendorDealsQuery, IEnumerable<VendorDealDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IDealRepository _deals;
    private readonly IApplicationDbContext _db;

    public GetVendorDealsQueryHandler(ICurrentUserService cu, IDealRepository deals, IApplicationDbContext db)
    {
        _currentUser = cu; _deals = deals; _db = db;
    }

    public async Task<IEnumerable<VendorDealDto>> Handle(GetVendorDealsQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        var deals = await _deals.GetByVendorAsync(vendor.Id, ct);
        return deals.Select(d => new VendorDealDto(d.Id, d.Title, d.Slug, d.Status.ToString(),
            d.OriginalPrice, d.DiscountedPrice, d.QuantitySold, d.QuantityTotal, d.AvgRating, d.CreatedAt.ToString("O")));
    }
}
