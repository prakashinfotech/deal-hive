using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Admin;

// ─── Analytics ────────────────────────────────────────────────

public record GetAdminAnalyticsQuery : IRequest<AdminAnalyticsResponse>;

public record AdminAnalyticsResponse(
    decimal Gmv, int OrdersToday, int NewUsersToday,
    int ActiveDeals, int PendingApprovals);

public class GetAdminAnalyticsQueryHandler : IRequestHandler<GetAdminAnalyticsQuery, AdminAnalyticsResponse>
{
    private readonly IApplicationDbContext _db;

    public GetAdminAnalyticsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<AdminAnalyticsResponse> Handle(GetAdminAnalyticsQuery req, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;

        var gmv = await _db.Orders.AsNoTracking()
            .Where(o => o.Status == Domain.Enums.OrderStatus.Paid || o.Status == Domain.Enums.OrderStatus.Fulfilled)
            .SumAsync(o => o.TotalAmount, ct);

        var ordersToday = await _db.Orders.AsNoTracking()
            .CountAsync(o => o.CreatedAt >= today, ct);

        var activeDeals = await _db.Deals.AsNoTracking()
            .CountAsync(d => d.Status == Domain.Enums.DealStatus.Active, ct);

        var pendingApprovals = await _db.Deals.AsNoTracking()
            .CountAsync(d => d.Status == Domain.Enums.DealStatus.PendingApproval, ct)
            + await _db.Vendors.AsNoTracking()
            .CountAsync(v => v.Status == Domain.Enums.VendorStatus.Pending, ct);

        return new AdminAnalyticsResponse(gmv, ordersToday, 0, activeDeals, pendingApprovals);
    }
}

// ─── Approve / Reject Deal ────────────────────────────────────

public record AdminApproveDealCommand(Guid DealId) : IRequest;
public record AdminRejectDealCommand(Guid DealId, string Reason) : IRequest;

public class AdminApproveDealCommandHandler : IRequestHandler<AdminApproveDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _email;
    private readonly IApplicationDbContext _db;

    public AdminApproveDealCommandHandler(IDealRepository deals, IUnitOfWork uow, IEmailService email, IApplicationDbContext db)
    {
        _deals = deals; _uow = uow; _email = email; _db = db;
    }

    public async Task Handle(AdminApproveDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);

        deal.Approve();
        await _uow.SaveChangesAsync(ct);

        var vendor = await _db.Vendors.FindAsync([deal.VendorId], ct);
        if (vendor != null)
        {
            var user = await _db.Vendors
                .Where(v => v.Id == deal.VendorId)
                .Select(v => v.UserId)
                .FirstOrDefaultAsync(ct);

            // Email notification would go here — we'd need IIdentityService to get the email
            // Left as placeholder since it needs IIdentityService injection
        }
    }
}

public class AdminRejectDealCommandHandler : IRequestHandler<AdminRejectDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _email;
    private readonly IIdentityService _identity;
    private readonly IApplicationDbContext _db;

    public AdminRejectDealCommandHandler(IDealRepository deals, IUnitOfWork uow, IEmailService email,
        IIdentityService identity, IApplicationDbContext db)
    {
        _deals = deals; _uow = uow; _email = email; _identity = identity; _db = db;
    }

    public async Task Handle(AdminRejectDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);

        deal.Reject(req.Reason);
        await _uow.SaveChangesAsync(ct);

        var vendor = await _db.Vendors.FindAsync([deal.VendorId], ct);
        if (vendor != null)
        {
            var user = await _identity.GetByIdAsync(vendor.UserId);
            if (user != null)
                await _email.SendDealApprovalAsync(user.Email, vendor.BusinessName, deal.Title, false, req.Reason, ct);
        }
    }
}

// ─── Approve / Suspend Vendor ────────────────────────────────

public record AdminPauseDealCommand(Guid DealId) : IRequest;
public record AdminResumeDealCommand(Guid DealId) : IRequest;
public record AdminApproveVendorCommand(Guid VendorId) : IRequest;
public record AdminSuspendVendorCommand(Guid VendorId, string Reason) : IRequest;

public class AdminPauseDealCommandHandler : IRequestHandler<AdminPauseDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    public AdminPauseDealCommandHandler(IDealRepository deals, IUnitOfWork uow) { _deals = deals; _uow = uow; }

    public async Task Handle(AdminPauseDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);
        deal.Pause();
        await _uow.SaveChangesAsync(ct);
    }
}

public class AdminResumeDealCommandHandler : IRequestHandler<AdminResumeDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    public AdminResumeDealCommandHandler(IDealRepository deals, IUnitOfWork uow) { _deals = deals; _uow = uow; }

    public async Task Handle(AdminResumeDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);
        deal.Resume();
        await _uow.SaveChangesAsync(ct);
    }
}

public class AdminApproveVendorCommandHandler : IRequestHandler<AdminApproveVendorCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public AdminApproveVendorCommandHandler(IUnitOfWork uow, IApplicationDbContext db) { _uow = uow; _db = db; }

    public async Task Handle(AdminApproveVendorCommand req, CancellationToken ct)
    {
        var vendor = await _db.Vendors.FindAsync([req.VendorId], ct)
            ?? throw new NotFoundException("Vendor", req.VendorId);
        vendor.Approve();
        await _uow.SaveChangesAsync(ct);
    }
}

public class AdminSuspendVendorCommandHandler : IRequestHandler<AdminSuspendVendorCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public AdminSuspendVendorCommandHandler(IUnitOfWork uow, IApplicationDbContext db) { _uow = uow; _db = db; }

    public async Task Handle(AdminSuspendVendorCommand req, CancellationToken ct)
    {
        var vendor = await _db.Vendors.FindAsync([req.VendorId], ct)
            ?? throw new NotFoundException("Vendor", req.VendorId);
        vendor.Suspend(req.Reason);
        await _uow.SaveChangesAsync(ct);
    }
}

// ─── Get Pending Deals ───────────────────────────────────────

public record GetAdminDealsQuery(string? Status = null, int Page = 1, int PageSize = 20)
    : IRequest<PaginatedAdminDealsResponse>;

public record AdminDealDto(Guid Id, string Title, string Slug, string Status, string VendorName, decimal DiscountedPrice, int QuantitySold, string CreatedAt);
public record PaginatedAdminDealsResponse(IEnumerable<AdminDealDto> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public class GetAdminDealsQueryHandler : IRequestHandler<GetAdminDealsQuery, PaginatedAdminDealsResponse>
{
    private readonly IApplicationDbContext _db;

    public GetAdminDealsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedAdminDealsResponse> Handle(GetAdminDealsQuery req, CancellationToken ct)
    {
        var query = _db.Deals.AsNoTracking().Include(d => d.Vendor)
            .Where(d => d.Status != Domain.Enums.DealStatus.Draft) // Draft deals are vendor-only
            .AsQueryable();

        if (!string.IsNullOrEmpty(req.Status) && Enum.TryParse<Domain.Enums.DealStatus>(req.Status, out var status))
            query = query.Where(d => d.Status == status);

        query = query.OrderByDescending(d => d.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedAdminDealsResponse(
            items.Select(d => new AdminDealDto(d.Id, d.Title, d.Slug, d.Status.ToString(),
                d.Vendor.BusinessName, d.DiscountedPrice, d.QuantitySold, d.CreatedAt.ToString("O"))),
            total, req.Page, req.PageSize, pages);
    }
}

// ─── Get Admin Vendors ───────────────────────────────────────

public record GetAdminVendorsQuery(string? Status = null, int Page = 1, int PageSize = 20)
    : IRequest<PaginatedAdminVendorsResponse>;

public record AdminVendorDto(Guid Id, string BusinessName, string Slug, string Status, string? City, int TotalDeals, decimal AvgRating, string CreatedAt);
public record PaginatedAdminVendorsResponse(IEnumerable<AdminVendorDto> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public class GetAdminVendorsQueryHandler : IRequestHandler<GetAdminVendorsQuery, PaginatedAdminVendorsResponse>
{
    private readonly IApplicationDbContext _db;

    public GetAdminVendorsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedAdminVendorsResponse> Handle(GetAdminVendorsQuery req, CancellationToken ct)
    {
        var query = _db.Vendors.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(req.Status) && Enum.TryParse<Domain.Enums.VendorStatus>(req.Status, out var status))
            query = query.Where(v => v.Status == status);

        query = query.OrderByDescending(v => v.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedAdminVendorsResponse(
            items.Select(v => new AdminVendorDto(v.Id, v.BusinessName, v.Slug, v.Status.ToString(),
                v.City, v.TotalDeals, v.AvgRating, v.CreatedAt.ToString("O"))),
            total, req.Page, req.PageSize, pages);
    }
}
