using FluentValidation;
using MediatR;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Auth;

// ─── Register ────────────────────────────────────────────────

public record RegisterCommand(string FirstName, string LastName, string Email, string Password)
    : IRequest<AuthCommandResponse>;

public record AuthCommandResponse(Guid UserId, string Email, string AccessToken, string Message);

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthCommandResponse>
{
    private readonly IIdentityService _identity;
    private readonly IJwtTokenService _jwt;
    private readonly IEmailService _email;

    public RegisterCommandHandler(IIdentityService identity, IJwtTokenService jwt, IEmailService email)
    {
        _identity = identity; _jwt = jwt; _email = email;
    }

    public async Task<AuthCommandResponse> Handle(RegisterCommand req, CancellationToken ct)
    {
        if (await _identity.UserExistsAsync(req.Email))
            throw new ConflictException("An account with this email already exists.");

        var (succeeded, error, userId) = await _identity.CreateUserAsync(
            req.Email, req.Password, req.FirstName, req.LastName);

        if (!succeeded) throw new DomainException(error ?? "Registration failed.");

        var user = (await _identity.GetByIdAsync(userId))!;
        var accessToken = _jwt.GenerateAccessToken(user);

        // Send verification email — fire-and-forget so a missing email config
        // doesn't block registration in development.
        _ = Task.Run(async () =>
        {
            try
            {
                var token = await _identity.GenerateEmailVerificationTokenAsync(userId);
                await _email.SendEmailVerificationAsync(req.Email, req.FirstName, token, ct);
            }
            catch { /* swallow — email is non-critical */ }
        }, ct);

        return new AuthCommandResponse(userId, req.Email, accessToken, "Registration successful. Please verify your email.");
    }
}

// ─── Login ────────────────────────────────────────────────────

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;

public record LoginResponse(string AccessToken, int ExpiresIn, UserDto User);
public record UserDto(Guid Id, string Email, string FirstName, string LastName, string Role, bool IsEmailVerified, string? AvatarUrl);

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IIdentityService _identity;
    private readonly IJwtTokenService _jwt;

    public LoginCommandHandler(IIdentityService identity, IJwtTokenService jwt)
    {
        _identity = identity; _jwt = jwt;
    }

    public async Task<LoginResponse> Handle(LoginCommand req, CancellationToken ct)
    {
        var (succeeded, userId, role, domainUser) = await _identity.CheckPasswordAsync(req.Email, req.Password);

        if (!succeeded || domainUser is null)
            throw new UnauthorizedException("Invalid email or password.");

        var accessToken = _jwt.GenerateAccessToken(domainUser);
        var userDto = new UserDto(domainUser.Id, domainUser.Email, domainUser.FirstName,
            domainUser.LastName, domainUser.Role.ToString(), domainUser.IsEmailVerified, domainUser.AvatarUrl);

        return new LoginResponse(accessToken, 900, userDto);
    }
}

// ─── Logout ──────────────────────────────────────────────────

public record LogoutCommand(string? RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IJwtTokenService _jwt;

    public LogoutCommandHandler(IJwtTokenService jwt) => _jwt = jwt;

    public async Task Handle(LogoutCommand req, CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(req.RefreshToken))
            await _jwt.RevokeRefreshTokenAsync(req.RefreshToken, ct);
    }
}

// ─── Refresh Token ────────────────────────────────────────────

public record RefreshTokenCommand(string Token) : IRequest<RefreshTokenResponse>;
public record RefreshTokenResponse(string AccessToken, int ExpiresIn, string NewRefreshToken);

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
{
    private readonly IJwtTokenService _jwt;
    private readonly IIdentityService _identity;

    public RefreshTokenCommandHandler(IJwtTokenService jwt, IIdentityService identity)
    {
        _jwt = jwt; _identity = identity;
    }

    public async Task<RefreshTokenResponse> Handle(RefreshTokenCommand req, CancellationToken ct)
    {
        var (isValid, userId) = await _jwt.ValidateRefreshTokenAsync(req.Token, ct);
        if (!isValid) throw new UnauthorizedException("Invalid or expired refresh token.");

        await _jwt.RevokeRefreshTokenAsync(req.Token, ct);
        var newRefreshToken = await _jwt.GenerateRefreshTokenAsync(userId, ct);

        var user = await _identity.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        var accessToken = _jwt.GenerateAccessToken(user);
        return new RefreshTokenResponse(accessToken, 900, newRefreshToken);
    }
}

// ─── Forgot / Reset Password ─────────────────────────────────

public record ForgotPasswordCommand(string Email) : IRequest;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly IIdentityService _identity;
    private readonly IEmailService _email;

    public ForgotPasswordCommandHandler(IIdentityService identity, IEmailService email)
    {
        _identity = identity; _email = email;
    }

    public async Task Handle(ForgotPasswordCommand req, CancellationToken ct)
    {
        var token = await _identity.GeneratePasswordResetTokenAsync(req.Email);
        if (token is null) return; // Don't reveal whether email exists

        await _email.SendPasswordResetAsync(req.Email, "there", token, ct);
    }
}

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");
    }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand>
{
    private readonly IIdentityService _identity;

    public ResetPasswordCommandHandler(IIdentityService identity) => _identity = identity;

    public async Task Handle(ResetPasswordCommand req, CancellationToken ct)
    {
        var (succeeded, error) = await _identity.ResetPasswordAsync(req.Email, req.Token, req.NewPassword);
        if (!succeeded) throw new DomainException(error ?? "Password reset failed.");
    }
}

// ─── Verify Email ─────────────────────────────────────────────

public record VerifyEmailCommand(Guid UserId, string Token) : IRequest;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand>
{
    private readonly IIdentityService _identity;

    public VerifyEmailCommandHandler(IIdentityService identity) => _identity = identity;

    public async Task Handle(VerifyEmailCommand req, CancellationToken ct)
    {
        var (succeeded, error) = await _identity.VerifyEmailAsync(req.UserId, req.Token);
        if (!succeeded) throw new DomainException(error ?? "Email verification failed.");
    }
}
