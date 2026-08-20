using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Infrastructure.ExternalServices.Stripe;

public class StripeService : IStripeService
{
    private readonly bool _configured;
    private readonly ILogger<StripeService> _logger;

    public StripeService(IConfiguration config, ILogger<StripeService> logger)
    {
        _logger = logger;
        var key = config["Stripe:SecretKey"];
        _configured = !string.IsNullOrWhiteSpace(key);
        if (_configured)
            StripeConfiguration.ApiKey = key;
        else
            _logger.LogWarning("Stripe:SecretKey is not configured — payments will be simulated.");
    }

    public async Task<string> CreatePaymentIntentAsync(Guid orderId, decimal amount, string currency,
        Dictionary<string, string>? metadata = null, CancellationToken ct = default)
    {
        if (!_configured)
        {
            _logger.LogWarning("Stripe not configured — returning simulated client secret for order {OrderId}", orderId);
            return $"sim_secret_{orderId}_secret_simulated";
        }

        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency.ToLower(),
            Metadata = metadata ?? new Dictionary<string, string>(),
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
        };
        options.Metadata["orderId"] = orderId.ToString();

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options, cancellationToken: ct);
        return intent.ClientSecret;
    }

    public async Task<string> CreateConnectedAccountAsync(string email, string businessName, CancellationToken ct = default)
    {
        var options = new AccountCreateOptions
        {
            Type = "express",
            Email = email,
            BusinessProfile = new AccountBusinessProfileOptions { Name = businessName },
        };
        var service = new AccountService();
        var account = await service.CreateAsync(options, cancellationToken: ct);
        return account.Id;
    }

    public async Task<string> TransferToVendorAsync(string vendorStripeAccountId, long amountCents,
        string currency, CancellationToken ct = default)
    {
        var options = new TransferCreateOptions
        {
            Amount = amountCents,
            Currency = currency.ToLower(),
            Destination = vendorStripeAccountId,
        };
        var service = new TransferService();
        var transfer = await service.CreateAsync(options, cancellationToken: ct);
        return transfer.Id;
    }

    public async Task<string> RefundPaymentAsync(string paymentIntentId, long? amountCents = null, CancellationToken ct = default)
    {
        var options = new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
        };
        if (amountCents.HasValue) options.Amount = amountCents.Value;

        var service = new RefundService();
        var refund = await service.CreateAsync(options, cancellationToken: ct);
        return refund.Id;
    }

    public global::Stripe.Event ConstructWebhookEvent(string payload, string signature, string secret)
    {
        try
        {
            return EventUtility.ConstructEvent(payload, signature, secret);
        }
        catch (StripeException ex)
        {
            throw new DomainException($"Stripe webhook signature validation failed: {ex.Message}");
        }
    }
}
