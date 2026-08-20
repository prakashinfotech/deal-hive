using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;
using GrouponClone.Domain.Enums;

namespace GrouponClone.Application.Features.Deals.Commands;

// ─── Commands ────────────────────────────────────────────────

public record SubmitDealForApprovalCommand(Guid DealId) : IRequest;

public record UpdateDealCommand(
    Guid DealId,
    int CategoryId,
    string Title, string ShortDescription, string Description, string? FinePrint,
    decimal OriginalPrice, decimal DiscountedPrice,
    DateTime StartsAt, DateTime? ExpiresAt,
    int? QuantityTotal, int? QuantityLimit, int VoucherValidity,
    List<UpdateDealOptionDto> Options
) : IRequest;

public record UpdateDealOptionDto(Guid? Id, string Title, string? Description, decimal Price, int? Quantity);

// ─── GetVendorDealById ────────────────────────────────────────

public record GetVendorDealByIdQuery(Guid DealId) : IRequest<VendorDealDetailDto?>;

public record VendorDealDetailDto(
    Guid Id, string Title, string ShortDescription, string Description,
    string? FinePrint, decimal OriginalPrice, decimal DiscountedPrice,
    string StartsAt, string? ExpiresAt, int? QuantityTotal, int? QuantityLimit,
    int VoucherValidity, int CategoryId, string Status, string Type,
    List<VendorDealOptionDto> Options
);

public record VendorDealOptionDto(Guid Id, string Title, string? Description, decimal Price, int? Quantity);
public record RecordDealViewCommand(Guid DealId) : IRequest;
public record ApproveDealCommand(Guid DealId) : IRequest;
public record RejectDealCommand(Guid DealId, string Reason) : IRequest;
public record PauseDealCommand(Guid DealId) : IRequest;

// ─── Handlers ────────────────────────────────────────────────

public class SubmitDealForApprovalCommandHandler : IRequestHandler<SubmitDealForApprovalCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public SubmitDealForApprovalCommandHandler(IDealRepository deals, IUnitOfWork uow, ICurrentUserService cu, IApplicationDbContext db)
    {
        _deals = deals; _uow = uow; _currentUser = cu; _db = db;
    }

    public async Task Handle(SubmitDealForApprovalCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        // deal.VendorId is Vendor.Id, not User.Id — resolve vendor first
        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);

        if (deal.VendorId != vendor.Id)
            throw new ForbiddenException();

        deal.SubmitForApproval();
        await _uow.SaveChangesAsync(ct);
    }
}

public class RecordDealViewCommandHandler : IRequestHandler<RecordDealViewCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;

    public RecordDealViewCommandHandler(IDealRepository deals, IUnitOfWork uow) { _deals = deals; _uow = uow; }

    public async Task Handle(RecordDealViewCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct);
        if (deal is null) return;
        deal.IncrementViews();
        await _uow.SaveChangesAsync(ct);
    }
}

public class ApproveDealCommandHandler : IRequestHandler<ApproveDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;

    public ApproveDealCommandHandler(IDealRepository deals, IUnitOfWork uow) { _deals = deals; _uow = uow; }

    public async Task Handle(ApproveDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);
        deal.Approve();
        await _uow.SaveChangesAsync(ct);
    }
}

public class RejectDealCommandHandler : IRequestHandler<RejectDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;

    public RejectDealCommandHandler(IDealRepository deals, IUnitOfWork uow) { _deals = deals; _uow = uow; }

    public async Task Handle(RejectDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);
        deal.Reject(req.Reason);
        await _uow.SaveChangesAsync(ct);
    }
}

public class PauseDealCommandHandler : IRequestHandler<PauseDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public PauseDealCommandHandler(IDealRepository deals, IUnitOfWork uow, ICurrentUserService cu)
    {
        _deals = deals; _uow = uow; _currentUser = cu;
    }

    public async Task Handle(PauseDealCommand req, CancellationToken ct)
    {
        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);

        if (deal.VendorId != _currentUser.UserId && _currentUser.Role != "Admin")
            throw new ForbiddenException();

        deal.Pause();
        await _uow.SaveChangesAsync(ct);
    }
}

// ─── GetVendorDealByIdHandler ─────────────────────────────────

public class GetVendorDealByIdQueryHandler : IRequestHandler<GetVendorDealByIdQuery, VendorDealDetailDto?>
{
    private readonly IDealRepository _deals;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public GetVendorDealByIdQueryHandler(IDealRepository deals, ICurrentUserService cu, IApplicationDbContext db)
    {
        _deals = deals; _currentUser = cu; _db = db;
    }

    public async Task<VendorDealDetailDto?> Handle(GetVendorDealByIdQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        // Use _db directly with Include so Options are eagerly loaded (FindAsync does not load nav props)
        var deal = await _db.Deals
            .Include(d => d.Options)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == req.DealId, ct);

        if (deal is null || deal.VendorId != vendor.Id) return null;

        return new VendorDealDetailDto(
            deal.Id, deal.Title, deal.ShortDescription, deal.Description,
            deal.FinePrint, deal.OriginalPrice, deal.DiscountedPrice,
            deal.StartsAt.ToString("O"), deal.ExpiresAt?.ToString("O"),
            deal.QuantityTotal, deal.QuantityLimit, deal.VoucherValidity,
            deal.CategoryId, deal.Status.ToString(), deal.Type.ToString(),
            deal.Options.OrderBy(o => o.SortOrder).Select(o => new VendorDealOptionDto(o.Id, o.Title, o.Description, o.Price, o.AvailableQty)).ToList()
        );
    }
}

// ─── UpdateDealHandler ────────────────────────────────────────

public class UpdateDealCommandHandler : IRequestHandler<UpdateDealCommand>
{
    private readonly IDealRepository _deals;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public UpdateDealCommandHandler(IDealRepository deals, IUnitOfWork uow, ICurrentUserService cu, IApplicationDbContext db)
    {
        _deals = deals; _uow = uow; _currentUser = cu; _db = db;
    }

    public async Task Handle(UpdateDealCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        var deal = await _deals.GetByIdAsync(req.DealId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Deal), req.DealId);

        if (deal.VendorId != vendor.Id) throw new ForbiddenException();

        deal.Update(req.Title, req.ShortDescription, req.Description, req.FinePrint,
            req.OriginalPrice, req.DiscountedPrice, req.StartsAt, req.ExpiresAt,
            req.QuantityTotal, req.QuantityLimit, req.VoucherValidity, req.CategoryId);

        // Sync options: remove all existing, re-add from request
        var existing = await _db.DealOptions.Where(o => o.DealId == deal.Id).ToListAsync(ct);
        _db.DealOptions.RemoveRange(existing);
        await _uow.SaveChangesAsync(ct);

        if (req.Options.Count > 0)
        {
            var newOptions = req.Options.Select((o, i) =>
                Domain.Entities.DealOption.Create(deal.Id, o.Title, o.Price, o.Description, o.Quantity, i));
            await _db.DealOptions.AddRangeAsync(newOptions, ct);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
