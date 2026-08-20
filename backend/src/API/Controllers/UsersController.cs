using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Users;
using GrouponClone.Application.Features.Deals.Queries;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    public UsersController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get the authenticated user's profile.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMe(CancellationToken ct)
        => Ok(await _mediator.Send(new GetCurrentUserQuery(), ct));

    /// <summary>Update profile.</summary>
    [HttpPut("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>Change password.</summary>
    [HttpPut("me/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>Get wishlist deals.</summary>
    [HttpGet("me/wishlist")]
    [ProducesResponseType(typeof(IEnumerable<DealSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWishlist(CancellationToken ct)
        => Ok(await _mediator.Send(new GetWishlistQuery(), ct));

    /// <summary>Toggle a deal in the wishlist.</summary>
    [HttpPost("me/wishlist")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ToggleWishlist([FromBody] ToggleWishlistCommand command, CancellationToken ct)
    {
        var isAdded = await _mediator.Send(command, ct);
        return Ok(new { wishlisted = isAdded });
    }

    /// <summary>Remove from wishlist.</summary>
    [HttpDelete("me/wishlist/{dealId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveFromWishlist(Guid dealId, CancellationToken ct)
    {
        await _mediator.Send(new ToggleWishlistCommand(dealId), ct);
        return NoContent();
    }
}
