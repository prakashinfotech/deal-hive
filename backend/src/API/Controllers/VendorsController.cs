using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Vendors;
using GrouponClone.Application.Features.Deals.Commands;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class VendorsController : ControllerBase
{
    private readonly IMediator _mediator;
    public VendorsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Register a new vendor profile.</summary>
    [HttpPost("register")]
    [Authorize]
    [ProducesResponseType(typeof(RegisterVendorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterVendorCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return StatusCode(201, result);
    }

    /// <summary>Get vendor dashboard metrics.</summary>
    [HttpGet("me/dashboard")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(typeof(VendorDashboardResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
        => Ok(await _mediator.Send(new GetVendorDashboardQuery(), ct));

    /// <summary>Get vendor's own deals.</summary>
    [HttpGet("me/deals")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(typeof(IEnumerable<VendorDealDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeals(CancellationToken ct)
        => Ok(await _mediator.Send(new GetVendorDealsQuery(), ct));

    /// <summary>Create a deal.</summary>
    [HttpPost("me/deals")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> CreateDeal(
        [FromBody] Application.Features.Deals.Commands.CreateDeal.CreateDealCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetDeals), result);
    }

    /// <summary>Get a single vendor deal by ID for editing.</summary>
    [HttpGet("me/deals/{id:guid}")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(typeof(VendorDealDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDeal(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVendorDealByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Get orders containing this vendor's items.</summary>
    [HttpGet("me/orders")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(typeof(Application.Features.Orders.PaginatedOrdersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new Application.Features.Orders.GetVendorOrdersQuery(page, pageSize), ct));

    /// <summary>Submit a draft deal for admin approval.</summary>
    [HttpPost("me/deals/{id:guid}/submit")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitDeal(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new SubmitDealForApprovalCommand(id), ct);
        return NoContent();
    }

    /// <summary>Update a vendor deal (Draft or Rejected status only).</summary>
    [HttpPut("me/deals/{id:guid}")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDeal(Guid id, [FromBody] UpdateDealRequest body, CancellationToken ct)
    {
        await _mediator.Send(new UpdateDealCommand(
            id, body.CategoryId, body.Title, body.ShortDescription, body.Description,
            body.FinePrint, body.OriginalPrice, body.DiscountedPrice,
            body.StartsAt, body.ExpiresAt, body.QuantityTotal, body.QuantityLimit,
            body.VoucherValidity, body.Options), ct);
        return NoContent();
    }
}

public record UpdateDealRequest(
    int CategoryId, string Title, string ShortDescription, string Description, string? FinePrint,
    decimal OriginalPrice, decimal DiscountedPrice,
    DateTime StartsAt, DateTime? ExpiresAt,
    int? QuantityTotal, int? QuantityLimit, int VoucherValidity,
    List<UpdateDealOptionDto> Options
);
