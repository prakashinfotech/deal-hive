// ============================================================
// GrouponClone.API — Deals Controller
// Controllers/DealsController.cs
// ============================================================

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Deals.Commands.CreateDeal;
using GrouponClone.Application.Features.Deals.Commands;
using GrouponClone.Application.Features.Deals.Queries;
using GrouponClone.Application.Interfaces;

namespace GrouponClone.API.Controllers;

/// <summary>Deals management endpoints.</summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class DealsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DealsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get paginated deals with optional filters.</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaginatedDealsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeals([FromQuery] GetDealsQuery query, CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    /// <summary>Get deal detail by slug.</summary>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(DealDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDeal(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDealBySlugQuery(slug), ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Get featured deals.</summary>
    [HttpGet("featured")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<DealSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeatured(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFeaturedDealsQuery(), ct);
        return Ok(result);
    }

    /// <summary>Get trending deals.</summary>
    [HttpGet("trending")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTrending(CancellationToken ct) =>
        Ok(await _mediator.Send(new GetTrendingDealsQuery(), ct));

    /// <summary>Get deals expiring soon.</summary>
    [HttpGet("expiring-soon")]
    [AllowAnonymous]
    public async Task<IActionResult> GetExpiringSoon(CancellationToken ct) =>
        Ok(await _mediator.Send(new GetExpiringSoonDealsQuery(), ct));

    /// <summary>Create a new deal (Vendor only).</summary>
    [HttpPost]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(typeof(CreateDealResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDeal([FromBody] CreateDealCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetDeal), new { slug = result.Slug }, result);
    }

    /// <summary>Submit deal for admin approval (Vendor only).</summary>
    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SubmitForApproval(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new SubmitDealForApprovalCommand(id), ct);
        return NoContent();
    }

    /// <summary>Increment view count for a deal.</summary>
    [HttpPost("{id:guid}/view")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecordView(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new RecordDealViewCommand(id), ct);
        return NoContent();
    }
}
