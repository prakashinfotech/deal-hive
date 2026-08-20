using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Orders;

// ─── Response DTOs ───────────────────────────────────────────

public record OrderItemDto(Guid Id, Guid DealId, string DealTitle, Guid? DealOptionId, string? OptionTitle, Guid VendorId, int Quantity, decimal UnitPrice, decimal TotalPrice);
public record VoucherDto(Guid Id, string Code, string? QrCodeUrl, Guid DealId, string DealTitle, string VendorName, string Status, string IssuedAt, string ExpiresAt, string? RedeemedAt);
public record PaymentDto(Guid Id, decimal Amount, string Currency, string Status, decimal RefundedAmount, string CreatedAt);

public record OrderDto(
    Guid Id, string OrderNumber, string Status,
    List<OrderItemDto> Items,
    decimal Subtotal, decimal DiscountAmount, decimal TaxAmount, decimal TotalAmount,
    string Currency, List<VoucherDto> Vouchers, PaymentDto? Payment,
    string? PromoCode, string? PaidAt, string CreatedAt);

public record PaginatedOrdersResponse(IEnumerable<OrderDto> Items, int TotalCount, int Page, int PageSize, int TotalPages);

// ─── Queries ─────────────────────────────────────────────────

public record GetOrdersQuery(int Page = 1, int PageSize = 10) : IRequest<PaginatedOrdersResponse>;
public record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto>;
public record GetVendorOrdersQuery(int Page = 1, int PageSize = 20) : IRequest<PaginatedOrdersResponse>;
public record GetAdminOrdersQuery(string? Status = null, int Page = 1, int PageSize = 20) : IRequest<PaginatedOrdersResponse>;

// ─── Handlers ────────────────────────────────────────────────

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, PaginatedOrdersResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public GetOrdersQueryHandler(ICurrentUserService cu, IApplicationDbContext db)
    {
        _currentUser = cu; _db = db;
    }

    public async Task<PaginatedOrdersResponse> Handle(GetOrdersQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var query = _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Vouchers)
            .Include(o => o.Payment)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var orders = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedOrdersResponse(orders.Select(OrderMapper.MapOrder), total, req.Page, req.PageSize, pages);
    }
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public GetOrderByIdQueryHandler(ICurrentUserService cu, IApplicationDbContext db)
    {
        _currentUser = cu; _db = db;
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var order = await _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Vouchers)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order), req.OrderId);

        if (order.UserId != userId && _currentUser.Role != "Admin")
            throw new ForbiddenException();

        return OrderMapper.MapOrder(order);
    }
}

public class GetVendorOrdersQueryHandler : IRequestHandler<GetVendorOrdersQuery, PaginatedOrdersResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public GetVendorOrdersQueryHandler(ICurrentUserService cu, IApplicationDbContext db)
    {
        _currentUser = cu; _db = db;
    }

    public async Task<PaginatedOrdersResponse> Handle(GetVendorOrdersQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new NotFoundException("Vendor", userId);

        var query = _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Vouchers)
            .Include(o => o.Payment)
            .Where(o => o.Items.Any(i => i.VendorId == vendor.Id))
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var orders = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedOrdersResponse(orders.Select(OrderMapper.MapOrder), total, req.Page, req.PageSize, pages);
    }
}

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, PaginatedOrdersResponse>
{
    private readonly IApplicationDbContext _db;

    public GetAdminOrdersQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedOrdersResponse> Handle(GetAdminOrdersQuery req, CancellationToken ct)
    {
        var query = _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Vouchers)
            .Include(o => o.Payment)
            .AsQueryable();

        if (!string.IsNullOrEmpty(req.Status) && Enum.TryParse<Domain.Enums.OrderStatus>(req.Status, out var status))
            query = query.Where(o => o.Status == status);

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var orders = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedOrdersResponse(orders.Select(OrderMapper.MapOrder), total, req.Page, req.PageSize, pages);
    }
}

internal static class OrderMapper
{
    public static OrderDto MapOrder(Domain.Entities.Order o) => new(
        o.Id, o.OrderNumber, o.Status.ToString(),
        o.Items.Select(i => new OrderItemDto(i.Id, i.DealId, i.DealTitle, i.DealOptionId, i.OptionTitle, i.VendorId, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList(),
        o.Subtotal, o.DiscountAmount, o.TaxAmount, o.TotalAmount, o.Currency,
        o.Vouchers.Select(v => new VoucherDto(v.Id, v.Code, v.QrCodeUrl, v.DealId, v.DealTitle, v.VendorName, v.Status.ToString(), v.CreatedAt.ToString("O"), v.ExpiresAt.ToString("O"), v.RedeemedAt?.ToString("O"))).ToList(),
        o.Payment is null ? null : new PaymentDto(o.Payment.Id, o.Payment.Amount, o.Payment.Currency, o.Payment.Status.ToString(), o.Payment.RefundedAmount, o.Payment.CreatedAt.ToString("O")),
        o.PromoCode, o.PaidAt?.ToString("O"), o.CreatedAt.ToString("O"));
}
