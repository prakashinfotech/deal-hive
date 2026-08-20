using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GrouponClone.Application.Features.Auth;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;

    public AuthController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    private CookieOptions RefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = !_env.IsDevelopment(),          // false on http://localhost, true in prod
        SameSite = _env.IsDevelopment()
            ? SameSiteMode.Lax                   // allows cross-port same-host requests in dev
            : SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
    };

    /// <summary>Register a new user.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthCommandResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return StatusCode(201, result);
    }

    /// <summary>Login with email and password.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);

        // Set refresh token in HttpOnly cookie
        var refreshToken = await HttpContext.RequestServices
            .GetRequiredService<Application.Interfaces.IJwtTokenService>()
            .GenerateRefreshTokenAsync(result.User.Id, ct);

        Response.Cookies.Append("refreshToken", refreshToken, RefreshTokenCookieOptions());

        return Ok(result);
    }

    /// <summary>Refresh access token using cookie.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token)) return Unauthorized();

        var result = await _mediator.Send(new RefreshTokenCommand(token), ct);

        Response.Cookies.Append("refreshToken", result.NewRefreshToken, RefreshTokenCookieOptions());

        return Ok(new { result.AccessToken, result.ExpiresIn });
    }

    /// <summary>Logout and revoke refresh token.</summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var token = Request.Cookies["refreshToken"];
        await _mediator.Send(new LogoutCommand(token), ct);
        Response.Cookies.Delete("refreshToken");
        return NoContent();
    }

    /// <summary>Send password reset email.</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { message = "If that email is registered, a reset link has been sent." });
    }

    /// <summary>Reset password with token.</summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>Verify email address.</summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
