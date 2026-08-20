using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Admin;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Policy = "AdminOnly")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;
    public AdminController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get admin analytics overview.</summary>
    [HttpGet("analytics/overview")]
    [ProducesResponseType(typeof(AdminAnalyticsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnalytics(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAdminAnalyticsQuery(), ct));

    /// <summary>Get deals with optional status filter.</summary>
    [HttpGet("deals")]
    [ProducesResponseType(typeof(PaginatedAdminDealsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeals([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAdminDealsQuery(status, page, pageSize), ct));

    /// <summary>Approve a deal.</summary>
    [HttpPut("deals/{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ApproveDeal(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new AdminApproveDealCommand(id), ct);
        return NoContent();
    }

    /// <summary>Reject a deal.</summary>
    [HttpPut("deals/{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RejectDeal(Guid id, [FromBody] RejectDealRequest request, CancellationToken ct)
    {
        await _mediator.Send(new AdminRejectDealCommand(id, request.Reason), ct);
        return NoContent();
    }

    /// <summary>Submit a draft deal for approval (admin-initiated).</summary>
    [HttpPut("deals/{id:guid}/submit")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SubmitDeal(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new GrouponClone.Application.Features.Deals.Commands.SubmitDealForApprovalCommand(id), ct);
        return NoContent();
    }

    /// <summary>Pause an active deal.</summary>
    [HttpPut("deals/{id:guid}/pause")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> PauseDeal(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new AdminPauseDealCommand(id), ct);
        return NoContent();
    }

    /// <summary>Resume a paused deal.</summary>
    [HttpPut("deals/{id:guid}/resume")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResumeDeal(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new AdminResumeDealCommand(id), ct);
        return NoContent();
    }

    /// <summary>Approve a vendor.</summary>
    [HttpPut("vendors/{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ApproveVendor(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new AdminApproveVendorCommand(id), ct);
        return NoContent();
    }

    /// <summary>Suspend a vendor.</summary>
    [HttpPut("vendors/{id:guid}/suspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SuspendVendor(Guid id, [FromBody] SuspendVendorRequest request, CancellationToken ct)
    {
        await _mediator.Send(new AdminSuspendVendorCommand(id, request.Reason), ct);
        return NoContent();
    }

    /// <summary>Get all orders with optional status filter.</summary>
    [HttpGet("orders")]
    [ProducesResponseType(typeof(GrouponClone.Application.Features.Orders.PaginatedOrdersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GrouponClone.Application.Features.Orders.GetAdminOrdersQuery(status, page, pageSize), ct));

    /// <summary>Get vendors with optional status filter.</summary>
    [HttpGet("vendors")]
    [ProducesResponseType(typeof(PaginatedAdminVendorsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVendors([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAdminVendorsQuery(status, page, pageSize), ct));
}

public record RejectDealRequest(string Reason);
public record SuspendVendorRequest(string Reason);
