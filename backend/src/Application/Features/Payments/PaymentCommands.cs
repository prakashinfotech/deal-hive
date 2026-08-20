using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Payments;

// ─── Create Payment Intent ────────────────────────────────────

public record CreatePaymentIntentCommand(Guid OrderId) : IRequest<PaymentIntentResponse>;
public record PaymentIntentResponse(string ClientSecret, string PublishableKey);

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, PaymentIntentResponse>
{
    private readonly IStripeService _stripe;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;
    private readonly IApplicationDbContext _db;

    public CreatePaymentIntentCommandHandler(
        IStripeService stripe, ICurrentUserService cu, IUnitOfWork uow,
        IConfiguration config, IApplicationDbContext db)
    {
        _stripe = stripe; _currentUser = cu; _uow = uow; _config = config; _db = db;
    }

    public async Task<PaymentIntentResponse> Handle(CreatePaymentIntentCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == req.OrderId && o.UserId == userId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        var clientSecret = await _stripe.CreatePaymentIntentAsync(order.Id, order.TotalAmount, order.Currency, ct: ct);
        order.SetPaymentIntent(clientSecret.Split("_secret_")[0]);
        await _uow.SaveChangesAsync(ct);

        return new PaymentIntentResponse(clientSecret, _config["Stripe:PublishableKey"] ?? "");
    }
}

// ─── Handle Stripe Webhook ────────────────────────────────────

public record HandleStripeWebhookCommand(string Payload, string Signature) : IRequest;

public class HandleStripeWebhookCommandHandler : IRequestHandler<HandleStripeWebhookCommand>
{
    private readonly IStripeService _stripe;
    private readonly IUnitOfWork _uow;
    private readonly IVoucherCodeGenerator _voucherGen;
    private readonly IIdentityService _identity;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly IApplicationDbContext _db;

    public HandleStripeWebhookCommandHandler(
        IStripeService stripe, IUnitOfWork uow, IVoucherCodeGenerator voucherGen,
        IIdentityService identity, IEmailService email,
        IConfiguration config, IApplicationDbContext db)
    {
        _stripe = stripe; _uow = uow; _voucherGen = voucherGen;
        _identity = identity; _email = email; _config = config; _db = db;
    }

    public async Task Handle(HandleStripeWebhookCommand req, CancellationToken ct)
    {
        var webhookSecret = _config["Stripe:WebhookSecret"] ?? "";
        var stripeEvent = _stripe.ConstructWebhookEvent(req.Payload, req.Signature, webhookSecret);

        switch (stripeEvent.Type)
        {
            case "payment_intent.succeeded":
                if (stripeEvent.Data.Object is Stripe.PaymentIntent intent)
                {
                    var orderId = intent.Metadata.TryGetValue("orderId", out var oid) ? Guid.Parse(oid) : (Guid?)null;
                    if (orderId is null) return;

                    var order = await _db.Orders
                        .Include(o => o.Items)
                        .FirstOrDefaultAsync(o => o.Id == orderId, ct);

                    if (order is null || order.Status != Domain.Enums.OrderStatus.Pending) return;

                    order.MarkPaid(intent.Id);

                    var payment = Payment.Create(order.Id, intent.Id, order.TotalAmount);
                    payment.MarkSucceeded();
                    await _db.Payments.AddAsync(payment, ct);

                    var vouchers = new List<Voucher>();
                    foreach (var item in order.Items)
                    {
                        var deal = await _db.Deals.Include(d => d.Vendor)
                            .FirstAsync(d => d.Id == item.DealId, ct);
                        for (var i = 0; i < item.Quantity; i++)
                            vouchers.Add(Voucher.Create(_voucherGen.Generate(), order.Id, order.UserId,
                                item.DealId, item.DealTitle, deal.VendorId, deal.Vendor.BusinessName, deal.VoucherValidity));
                        deal.IncrementSold(item.Quantity);
                    }

                    await _db.Vouchers.AddRangeAsync(vouchers, ct);
                    order.AddVouchers(vouchers);
                    await _uow.SaveChangesAsync(ct);
                }
                break;

            case "charge.refunded":
                // Handle refunds — update payment status
                break;
        }
    }
}

// ─── Refund ──────────────────────────────────────────────────

public record RefundOrderCommand(Guid OrderId, decimal Amount, string Reason) : IRequest;

public class RefundOrderCommandHandler : IRequestHandler<RefundOrderCommand>
{
    private readonly IStripeService _stripe;
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public RefundOrderCommandHandler(IStripeService stripe, IUnitOfWork uow, IApplicationDbContext db)
    {
        _stripe = stripe; _uow = uow; _db = db;
    }

    public async Task Handle(RefundOrderCommand req, CancellationToken ct)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.OrderId == req.OrderId, ct)
            ?? throw new NotFoundException("Payment", req.OrderId);

        var amountCents = (long)(req.Amount * 100);
        await _stripe.RefundPaymentAsync(payment.StripePaymentIntentId, amountCents, ct);

        payment.AddRefund(req.Amount);
        await _uow.SaveChangesAsync(ct);
    }
}
