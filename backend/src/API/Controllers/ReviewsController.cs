using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Reviews;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ReviewsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get reviews for a deal.</summary>
    [HttpGet("deals/{dealId:guid}/reviews")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaginatedReviewsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(Guid dealId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sort = "newest",
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetDealReviewsQuery(dealId, page, pageSize, sort), ct));

    /// <summary>Post a review for a deal.</summary>
    [HttpPost("deals/{dealId:guid}/reviews")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateReview(Guid dealId, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var reviewId = await _mediator.Send(
            new CreateReviewCommand(dealId, request.OrderId, request.Rating, request.Title, request.Body), ct);
        return StatusCode(201, new { reviewId });
    }

    /// <summary>Add vendor reply to a review.</summary>
    [HttpPut("reviews/{reviewId:guid}/vendor-reply")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AddVendorReply(Guid reviewId, [FromBody] AddVendorReplyRequest request, CancellationToken ct)
    {
        await _mediator.Send(new AddVendorReplyCommand(reviewId, request.Reply), ct);
        return NoContent();
    }
}

public record CreateReviewRequest(Guid OrderId, int Rating, string? Title, string? Body);
public record AddVendorReplyRequest(string Reply);
