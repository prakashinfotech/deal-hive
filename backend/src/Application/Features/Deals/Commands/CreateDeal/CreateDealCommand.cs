// ============================================================
// Application — Create Deal Command (CQRS Example)
// Features/Deals/Commands/CreateDeal/
// ============================================================

using FluentValidation;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Application.Features.Deals.Commands.CreateDeal;

// ─── Command ────────────────────────────────────────────────
public record CreateDealCommand(
    int CategoryId,
    string Title,
    string ShortDescription,
    string Description,
    string? FinePrint,
    DealType Type,
    decimal OriginalPrice,
    decimal DiscountedPrice,
    DateTime StartsAt,
    DateTime? ExpiresAt,
    int? QuantityTotal,
    int? QuantityLimit,
    int VoucherValidity,
    List<CreateDealOptionDto> Options
) : IRequest<CreateDealResponse>;

public record CreateDealOptionDto(string Title, string? Description, decimal Price, int? Quantity);
public record CreateDealResponse(Guid DealId, string Slug, string Status);

// ─── Validator ──────────────────────────────────────────────
public class CreateDealCommandValidator : AbstractValidator<CreateDealCommand>
{
    public CreateDealCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(300).WithMessage("Title must not exceed 300 characters.");

        RuleFor(x => x.ShortDescription)
            .NotEmpty().WithMessage("Short description is required.")
            .MaximumLength(500);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");

        RuleFor(x => x.OriginalPrice)
            .GreaterThan(0).WithMessage("Original price must be greater than 0.");

        RuleFor(x => x.DiscountedPrice)
            .GreaterThan(0).WithMessage("Discounted price must be greater than 0.")
            .LessThan(x => x.OriginalPrice).WithMessage("Discounted price must be less than original price.");

        RuleFor(x => x.StartsAt)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Start date cannot be in the past.");

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(x => x.StartsAt)
            .When(x => x.ExpiresAt.HasValue)
            .WithMessage("Expiry date must be after start date.");

        RuleFor(x => x.VoucherValidity)
            .InclusiveBetween(7, 365).WithMessage("Voucher validity must be between 7 and 365 days.");

        RuleForEach(x => x.Options).ChildRules(option =>
        {
            option.RuleFor(o => o.Title).NotEmpty().MaximumLength(200);
            option.RuleFor(o => o.Price).GreaterThan(0);
        });
    }
}

// ─── Handler ────────────────────────────────────────────────
public class CreateDealCommandHandler : IRequestHandler<CreateDealCommand, CreateDealResponse>
{
    private readonly IDealRepository _dealRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _db;

    public CreateDealCommandHandler(
        IDealRepository dealRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IApplicationDbContext db)
    {
        _dealRepository = dealRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _db = db;
    }

    public async Task<CreateDealResponse> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new UnauthorizedException("User not authenticated.");

        // Resolve Vendor.Id from the authenticated user's ID
        var vendor = await _db.Vendors.AsNoTracking()
            .FirstOrDefaultAsync(v => v.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Vendor", userId);

        var slug = GenerateSlug(request.Title);
        var slugExists = await _dealRepository.SlugExistsAsync(slug, cancellationToken);
        if (slugExists) slug = $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";

        var deal = Deal.Create(
            vendorId: vendor.Id,
            categoryId: request.CategoryId,
            title: request.Title,
            slug: slug,
            shortDescription: request.ShortDescription,
            description: request.Description,
            type: request.Type,
            originalPrice: request.OriginalPrice,
            discountedPrice: request.DiscountedPrice,
            startsAt: request.StartsAt,
            expiresAt: request.ExpiresAt,
            quantityTotal: request.QuantityTotal,
            quantityLimit: request.QuantityLimit,
            voucherValidity: request.VoucherValidity,
            finePrint: request.FinePrint
        );

        await _dealRepository.AddAsync(deal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken); // save deal first to get deal.Id

        // Persist deal options
        if (request.Options.Count > 0)
        {
            var options = request.Options.Select((o, i) =>
                DealOption.Create(deal.Id, o.Title, o.Price, o.Description, o.Quantity, sortOrder: i));

            await _db.DealOptions.AddRangeAsync(options, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new CreateDealResponse(deal.Id, deal.Slug, deal.Status.ToString());
    }

    private static string GenerateSlug(string title) =>
        System.Text.RegularExpressions.Regex
            .Replace(title.ToLowerInvariant().Trim(), @"[^a-z0-9\s-]", "")
            .Replace(" ", "-")
            .Trim('-');
}
