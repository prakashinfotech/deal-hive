using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Orders;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    /// <summary>Create a new order.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateOrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetOrder), new { id = result.OrderId }, result);
    }

    /// <summary>Get user's order history.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedOrdersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetOrdersQuery(page, pageSize), ct));

    /// <summary>Get order by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOrderByIdQuery(id), ct));

    /// <summary>Confirm payment for an order (simulated / non-Stripe payment methods).</summary>
    [HttpPost("{id:guid}/confirm")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmOrder(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ConfirmPaymentCommand(id, $"sim_{id}"), ct);
        return NoContent();
    }

    /// <summary>Cancel an order.</summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelOrder(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CancelOrderCommand(id), ct);
        return NoContent();
    }
}
