using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Reviews;

// ─── Create Review ────────────────────────────────────────────

public record CreateReviewCommand(Guid DealId, Guid OrderId, int Rating, string? Title, string? Body)
    : IRequest<Guid>;

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(x => x.DealId).NotEmpty();
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.Body).MaximumLength(5000).When(x => x.Body != null);
    }
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identity;
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public CreateReviewCommandHandler(ICurrentUserService cu, IIdentityService identity,
        IUnitOfWork uow, IApplicationDbContext db)
    {
        _currentUser = cu; _identity = identity; _uow = uow; _db = db;
    }

    public async Task<Guid> Handle(CreateReviewCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        // Verify user bought this deal
        var hasPurchased = await _db.OrderItems.AsNoTracking()
            .AnyAsync(oi => oi.DealId == req.DealId &&
                _db.Orders.Any(o => o.Id == oi.OrderId && o.UserId == userId &&
                    (o.Status == Domain.Enums.OrderStatus.Paid || o.Status == Domain.Enums.OrderStatus.Fulfilled)), ct);

        if (!hasPurchased) throw new ForbiddenException("You can only review deals you have purchased.");

        var alreadyReviewed = await _db.Reviews.AnyAsync(r => r.UserId == userId && r.DealId == req.DealId, ct);
        if (alreadyReviewed) throw new ConflictException("You have already reviewed this deal.");

        var user = await _identity.GetByIdAsync(userId)!;
        var review = Review.Create(req.DealId, userId, req.OrderId, user!.FullName, req.Rating, req.Title, req.Body, user.AvatarUrl);

        await _db.Reviews.AddAsync(review, ct);
        await _uow.SaveChangesAsync(ct);

        // Recalculate deal rating
        var ratingData = await _db.Reviews.AsNoTracking()
            .Where(r => r.DealId == req.DealId)
            .GroupBy(_ => true)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync(ct);

        var deal = await _db.Deals.FindAsync([req.DealId], ct);
        if (deal != null && ratingData != null)
            deal.UpdateRating((decimal)ratingData.Avg, ratingData.Count);
        await _uow.SaveChangesAsync(ct);

        return review.Id;
    }
}

// ─── Get Reviews ──────────────────────────────────────────────

public record GetDealReviewsQuery(Guid DealId, int Page = 1, int PageSize = 10, string Sort = "newest")
    : IRequest<PaginatedReviewsResponse>;

public record ReviewDto(Guid Id, Guid UserId, string UserFullName, string? UserAvatarUrl,
    int Rating, string? Title, string? Body, string? VendorReply, string? VendorRepliedAt,
    bool IsVerified, string CreatedAt);
public record PaginatedReviewsResponse(IEnumerable<ReviewDto> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public class GetDealReviewsQueryHandler : IRequestHandler<GetDealReviewsQuery, PaginatedReviewsResponse>
{
    private readonly IApplicationDbContext _db;

    public GetDealReviewsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedReviewsResponse> Handle(GetDealReviewsQuery req, CancellationToken ct)
    {
        var query = _db.Reviews.AsNoTracking().Where(r => r.DealId == req.DealId);

        query = req.Sort switch
        {
            "rating_high" => query.OrderByDescending(r => r.Rating),
            "rating_low" => query.OrderBy(r => r.Rating),
            _ => query.OrderByDescending(r => r.CreatedAt),
        };

        var total = await query.CountAsync(ct);
        var items = await query.Skip((req.Page - 1) * req.PageSize).Take(req.PageSize).ToListAsync(ct);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);

        return new PaginatedReviewsResponse(
            items.Select(r => new ReviewDto(r.Id, r.UserId, r.UserFullName, r.UserAvatarUrl,
                r.Rating, r.Title, r.Body, r.VendorReply, r.VendorRepliedAt?.ToString("O"),
                r.IsVerified, r.CreatedAt.ToString("O"))),
            total, req.Page, req.PageSize, pages);
    }
}

// ─── Vendor Reply ────────────────────────────────────────────

public record AddVendorReplyCommand(Guid ReviewId, string Reply) : IRequest;

public class AddVendorReplyCommandHandler : IRequestHandler<AddVendorReplyCommand>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;
    private readonly IApplicationDbContext _db;

    public AddVendorReplyCommandHandler(ICurrentUserService cu, IUnitOfWork uow, IApplicationDbContext db)
    {
        _currentUser = cu; _uow = uow; _db = db;
    }

    public async Task Handle(AddVendorReplyCommand req, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var review = await _db.Reviews.FindAsync([req.ReviewId], ct)
            ?? throw new NotFoundException(nameof(Review), req.ReviewId);

        var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new ForbiddenException("Only the deal's vendor can reply.");

        // Verify vendor owns the deal
        var deal = await _db.Deals.FindAsync([review.DealId], ct);
        if (deal?.VendorId != vendor.Id) throw new ForbiddenException();

        review.AddVendorReply(req.Reply);
        await _uow.SaveChangesAsync(ct);
    }
}
