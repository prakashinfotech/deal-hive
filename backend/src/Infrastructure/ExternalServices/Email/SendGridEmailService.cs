using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using GrouponClone.Application.Interfaces;

namespace GrouponClone.Infrastructure.ExternalServices.Email;

public class SendGridEmailService : IEmailService
{
    private readonly ISendGridClient? _client;
    private readonly string _fromEmail;
    private readonly string _fromName = "DealHive";
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(IConfiguration config, ILogger<SendGridEmailService> logger)
    {
        var apiKey = config["SendGrid:ApiKey"];
        _client = string.IsNullOrWhiteSpace(apiKey) ? null : new SendGridClient(apiKey);
        _fromEmail = config["SendGrid:FromEmail"] ?? "noreply@dealhive.com";
        _logger = logger;

        if (_client is null)
            _logger.LogWarning("SendGrid:ApiKey is not configured — emails will be skipped.");
    }

    public async Task SendOrderConfirmationAsync(string toEmail, string firstName, string orderNumber,
        decimal total, CancellationToken ct = default)
    {
        var msg = BuildMessage(toEmail, $"Order Confirmed — {orderNumber}",
            $"<h2>Hi {firstName},</h2><p>Your order <strong>{orderNumber}</strong> for <strong>${total:F2}</strong> has been confirmed. Check your vouchers in your account.</p>");
        await SendAsync(msg, ct);
    }

    public async Task SendVoucherAsync(string toEmail, string firstName, IEnumerable<VoucherEmailDto> vouchers,
        CancellationToken ct = default)
    {
        var voucherHtml = string.Join("", vouchers.Select(v =>
            $"<tr><td>{v.DealTitle}</td><td>{v.VendorName}</td><td><strong>{v.Code}</strong></td><td>{v.ExpiresAt:d}</td></tr>"));

        var body = $"""
            <h2>Hi {firstName}, your vouchers are ready!</h2>
            <table border="1" cellpadding="8">
              <tr><th>Deal</th><th>Vendor</th><th>Code</th><th>Expires</th></tr>
              {voucherHtml}
            </table>
            """;

        var msg = BuildMessage(toEmail, "Your DealHive Vouchers", body);
        await SendAsync(msg, ct);
    }

    public async Task SendEmailVerificationAsync(string toEmail, string firstName, string token,
        CancellationToken ct = default)
    {
        var link = $"https://dealhive.com/auth/verify-email?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(toEmail)}";
        var body = $"<h2>Hi {firstName},</h2><p>Please <a href=\"{link}\">verify your email address</a> to activate your account.</p>";
        var msg = BuildMessage(toEmail, "Verify your DealHive email", body);
        await SendAsync(msg, ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string firstName, string token,
        CancellationToken ct = default)
    {
        var link = $"https://dealhive.com/auth/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(toEmail)}";
        var body = $"<h2>Hi {firstName},</h2><p>Click <a href=\"{link}\">here to reset your password</a>. This link expires in 1 hour.</p>";
        var msg = BuildMessage(toEmail, "Reset your DealHive password", body);
        await SendAsync(msg, ct);
    }

    public async Task SendDealApprovalAsync(string toEmail, string businessName, string dealTitle,
        bool approved, string? reason = null, CancellationToken ct = default)
    {
        var subject = approved ? $"Deal Approved: {dealTitle}" : $"Deal Rejected: {dealTitle}";
        var body = approved
            ? $"<h2>Hi {businessName},</h2><p>Your deal <strong>{dealTitle}</strong> has been approved and is now live!</p>"
            : $"<h2>Hi {businessName},</h2><p>Your deal <strong>{dealTitle}</strong> was not approved. Reason: {reason}</p>";
        var msg = BuildMessage(toEmail, subject, body);
        await SendAsync(msg, ct);
    }

    private SendGridMessage BuildMessage(string toEmail, string subject, string htmlBody)
    {
        var msg = new SendGridMessage
        {
            From = new EmailAddress(_fromEmail, _fromName),
            Subject = subject,
            HtmlContent = htmlBody,
        };
        msg.AddTo(new EmailAddress(toEmail));
        return msg;
    }

    private async Task SendAsync(SendGridMessage msg, CancellationToken ct)
    {
        if (_client is null)
        {
            _logger.LogWarning("Email skipped (no SendGrid key) — would have sent to {To}", msg.Personalizations[0].Tos[0].Email);
            return;
        }

        var response = await _client.SendEmailAsync(msg, ct);
        if (!response.IsSuccessStatusCode)
            _logger.LogWarning("SendGrid returned {StatusCode} for email to {To}", response.StatusCode, msg.Personalizations[0].Tos[0].Email);
    }
}
