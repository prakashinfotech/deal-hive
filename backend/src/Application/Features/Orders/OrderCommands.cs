using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Orders;

// ─── Create Order ─────────────────────────────────────────────

public record CreateOrderItemDto(Guid DealId, Guid? DealOptionId, int Quantity);
public record CreateOrderCommand(List<CreateOrderItemDto> Items, string? PromoCode) : IRequest<CreateOrderResponse>;
public record CreateOrderResponse(Guid OrderId, string OrderNumber, decimal Subtotal, decimal DiscountAmount, decimal TotalAmount, string StripeClientSecret);

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResponse>
{
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IStripeService _stripe;
    private readonly IApplicationDbContext _db;

    public CreateOrderCommandHandler(
        IUnitOfWork uow, ICurrentUserService cu, IStripeService stripe,
        IApplicationDbContext db)
    {
        _uow = uow; _currentUser = cu; _stripe = stripe; _db = db;
    }

    public async Task<CreateOrderResponse> Handle(CreateOrderCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var orderNumber = $"DH-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

        var orderItems = new List<OrderItem>();
        foreach (var item in req.Items)
        {
            var deal = await _db.Deals
                .Include(d => d.Options)
                .Include(d => d.Vendor)
                .FirstOrDefaultAsync(d => d.Id == item.DealId, ct)
                ?? throw new NotFoundException(nameof(Deal), item.DealId);

            if (!deal.IsAvailable()) throw new DomainException($"Deal '{deal.Title}' is not available.");

            var unitPrice = deal.DiscountedPrice;
            string? optionTitle = null;

            if (item.DealOptionId.HasValue)
            {
                var option = deal.Options.FirstOrDefault(o => o.Id == item.DealOptionId.Value)
                    ?? throw new NotFoundException(nameof(DealOption), item.DealOptionId.Value);
                if (!option.HasStock) throw new DomainException($"Option '{option.Title}' is out of stock.");
                unitPrice = option.Price;
                optionTitle = option.Title;
            }

            orderItems.Add(OrderItem.Create(
                Guid.Empty, // OrderId set when order is saved
                item.DealId, deal.Title, deal.VendorId,
                unitPrice, item.Quantity, item.DealOptionId, optionTitle));
        }

        decimal discount = 0;
        string? promoApplied = null;

        if (!string.IsNullOrEmpty(req.PromoCode))
        {
            var promo = await _db.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == req.PromoCode.ToUpperInvariant(), ct);

            if (promo != null)
            {
                var subtotalForPromo = orderItems.Sum(i => i.TotalPrice);
                if (promo.IsValid(subtotalForPromo))
                {
                    discount = promo.CalculateDiscount(subtotalForPromo);
                    promoApplied = promo.Code;
                    promo.IncrementUsage();
                }
            }
        }

        var order = Order.Create(userId, orderNumber, orderItems, discount, promoCode: promoApplied);

        await _db.Orders.AddAsync(order, ct);
        await _uow.SaveChangesAsync(ct);

        var clientSecret = await _stripe.CreatePaymentIntentAsync(
            order.Id, order.TotalAmount, "usd",
            new Dictionary<string, string> { ["orderNumber"] = orderNumber }, ct);

        order.SetPaymentIntent(clientSecret.Split("_secret_")[0]);
        await _uow.SaveChangesAsync(ct);

        return new CreateOrderResponse(order.Id, orderNumber, order.Subtotal, order.DiscountAmount, order.TotalAmount, clientSecret);
    }
}

// ─── Confirm Payment ──────────────────────────────────────────

public record ConfirmPaymentCommand(Guid OrderId, string PaymentIntentId) : IRequest;

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _email;
    private readonly IIdentityService _identity;
    private readonly IVoucherCodeGenerator _voucherGen;
    private readonly IApplicationDbContext _db;

    public ConfirmPaymentCommandHandler(
        IUnitOfWork uow, ICurrentUserService cu, IEmailService email,
        IIdentityService identity, IVoucherCodeGenerator voucherGen,
        IApplicationDbContext db)
    {
        _uow = uow; _currentUser = cu; _email = email;
        _identity = identity; _voucherGen = voucherGen; _db = db;
    }

    public async Task Handle(ConfirmPaymentCommand req, CancellationToken ct)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        if (order.UserId != _currentUser.UserId) throw new ForbiddenException();

        order.MarkPaid(req.PaymentIntentId);

        var payment = Payment.Create(order.Id, req.PaymentIntentId, order.TotalAmount);
        payment.MarkSucceeded();
        await _db.Payments.AddAsync(payment, ct);

        var vouchers = new List<Voucher>();
        foreach (var item in order.Items)
        {
            var deal = await _db.Deals
                .Include(d => d.Vendor)
                .FirstAsync(d => d.Id == item.DealId, ct);

            for (var i = 0; i < item.Quantity; i++)
            {
                var code = _voucherGen.Generate();
                var voucher = Voucher.Create(code, order.Id, order.UserId, item.DealId,
                    item.DealTitle, deal.VendorId, deal.Vendor.BusinessName, deal.VoucherValidity);
                vouchers.Add(voucher);
            }

            deal.IncrementSold(item.Quantity);
        }

        await _db.Vouchers.AddRangeAsync(vouchers, ct);
        order.AddVouchers(vouchers);
        await _uow.SaveChangesAsync(ct);

        // Send confirmation email
        var user = await _identity.GetByIdAsync(order.UserId);
        if (user != null)
        {
            await _email.SendOrderConfirmationAsync(user.Email, user.FirstName, order.OrderNumber, order.TotalAmount, ct);
            var voucherDtos = vouchers.Select(v => new VoucherEmailDto(v.Code, v.DealTitle, v.VendorName, v.ExpiresAt));
            await _email.SendVoucherAsync(user.Email, user.FirstName, voucherDtos, ct);
        }
    }
}

// ─── Cancel Order ────────────────────────────────────────────

public record CancelOrderCommand(Guid OrderId) : IRequest;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public CancelOrderCommandHandler(IUnitOfWork uow, ICurrentUserService cu, IApplicationDbContext db)
    {
        _uow = uow; _currentUser = cu; _db = db;
    }

    public async Task Handle(CancelOrderCommand req, CancellationToken ct)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        if (order.UserId != _currentUser.UserId && _currentUser.Role != "Admin")
            throw new ForbiddenException();

        order.Cancel();
        await _uow.SaveChangesAsync(ct);
    }
}
