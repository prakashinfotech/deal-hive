using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Payments;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Create a Stripe PaymentIntent for an order.</summary>
    [HttpPost("create-intent")]
    [Authorize]
    [ProducesResponseType(typeof(PaymentIntentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateIntent([FromBody] CreatePaymentIntentCommand command, CancellationToken ct)
        => Ok(await _mediator.Send(command, ct));

    /// <summary>Refund a payment (Admin only).</summary>
    [HttpPost("{orderId:guid}/refund")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Refund(Guid orderId, [FromBody] RefundRequest request, CancellationToken ct)
    {
        await _mediator.Send(new RefundOrderCommand(orderId, request.Amount, request.Reason), ct);
        return NoContent();
    }
}

/// <summary>Stripe webhook endpoint — no auth, Stripe signature verified in handler.</summary>
[ApiController]
[Route("api/v1/webhooks")]
public class WebhooksController : ControllerBase
{
    private readonly IMediator _mediator;
    public WebhooksController(IMediator mediator) => _mediator = mediator;

    [HttpPost("stripe")]
    [AllowAnonymous]
    public async Task<IActionResult> Stripe(CancellationToken ct)
    {
        var payload = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        await _mediator.Send(new HandleStripeWebhookCommand(payload, signature), ct);
        return Ok();
    }
}

public record RefundRequest(decimal Amount, string Reason);
