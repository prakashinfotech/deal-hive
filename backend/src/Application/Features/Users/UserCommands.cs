using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Application.Features.Deals.Queries;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Users;

// ─── Get Current User ────────────────────────────────────────

public record GetCurrentUserQuery : IRequest<CurrentUserResponse>;
public record CurrentUserResponse(Guid Id, string Email, string FirstName, string LastName, string Role, bool IsEmailVerified, string? AvatarUrl);

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, CurrentUserResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identity;

    public GetCurrentUserQueryHandler(ICurrentUserService cu, IIdentityService identity)
    {
        _currentUser = cu; _identity = identity;
    }

    public async Task<CurrentUserResponse> Handle(GetCurrentUserQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var user = await _identity.GetByIdAsync(userId) ?? throw new NotFoundException("User", userId);
        return new CurrentUserResponse(user.Id, user.Email, user.FirstName, user.LastName,
            user.Role.ToString(), user.IsEmailVerified, user.AvatarUrl);
    }
}

// ─── Update Profile ──────────────────────────────────────────

public record UpdateProfileCommand(string FirstName, string LastName, string? PhoneNumber) : IRequest;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identity;

    public UpdateProfileCommandHandler(ICurrentUserService cu, IIdentityService identity)
    {
        _currentUser = cu; _identity = identity;
    }

    public async Task Handle(UpdateProfileCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var (succeeded, error) = await _identity.UpdateProfileAsync(userId, req.FirstName, req.LastName, req.PhoneNumber);
        if (!succeeded) throw new DomainException(error ?? "Profile update failed.");
    }
}

// ─── Change Password ─────────────────────────────────────────

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identity;

    public ChangePasswordCommandHandler(ICurrentUserService cu, IIdentityService identity)
    {
        _currentUser = cu; _identity = identity;
    }

    public async Task Handle(ChangePasswordCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var (succeeded, error) = await _identity.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);
        if (!succeeded) throw new DomainException(error ?? "Password change failed.");
    }
}

// ─── Wishlist ────────────────────────────────────────────────

public record ToggleWishlistCommand(Guid DealId) : IRequest<bool>;

public class ToggleWishlistCommandHandler : IRequestHandler<ToggleWishlistCommand, bool>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public ToggleWishlistCommandHandler(ICurrentUserService cu, IUnitOfWork uow, IApplicationDbContext db)
    {
        _currentUser = cu; _uow = uow; _db = db;
    }

    public async Task<bool> Handle(ToggleWishlistCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var existing = await _db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.DealId == req.DealId, ct);

        if (existing is not null)
        {
            _db.WishlistItems.Remove(existing);
            await _uow.SaveChangesAsync(ct);
            return false;
        }

        await _db.WishlistItems.AddAsync(Domain.Entities.WishlistItem.Create(userId, req.DealId), ct);
        await _uow.SaveChangesAsync(ct);
        return true;
    }
}

public record GetWishlistQuery : IRequest<IEnumerable<DealSummaryResponse>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, IEnumerable<DealSummaryResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;
    private readonly IMapper _mapper;

    public GetWishlistQueryHandler(ICurrentUserService cu, IApplicationDbContext db, IMapper mapper)
    {
        _currentUser = cu; _db = db; _mapper = mapper;
    }

    public async Task<IEnumerable<DealSummaryResponse>> Handle(GetWishlistQuery req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var deals = await _db.WishlistItems
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Join(_db.Deals.AsNoTracking()
                .Include(d => d.Vendor)
                .Include(d => d.Category)
                .Include(d => d.Images),
                w => w.DealId, d => d.Id, (_, d) => d)
            .ToListAsync(ct);

        return _mapper.Map<IEnumerable<DealSummaryResponse>>(deals);
    }
}
