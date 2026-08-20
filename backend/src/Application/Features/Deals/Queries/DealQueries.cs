using AutoMapper;
using MediatR;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Application.Features.Deals.Queries;

// ─── Response DTOs ────────────────────────────────────────────

public class DealSummaryResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = "";
    public string Slug { get; init; } = "";
    public string ShortDescription { get; init; } = "";
    public decimal OriginalPrice { get; init; }
    public decimal DiscountedPrice { get; init; }
    public decimal DiscountPercent { get; init; }
    public string PrimaryImageUrl { get; init; } = "";
    public string VendorName { get; init; } = "";
    public string VendorCity { get; init; } = "";
    public string CategoryName { get; init; } = "";
    public string CategorySlug { get; init; } = "";
    public decimal AvgRating { get; init; }
    public int ReviewCount { get; init; }
    public int QuantitySold { get; init; }
    public string? ExpiresAt { get; init; }
    public bool IsFeatured { get; init; }
    public string Type { get; init; } = "";
}

public class DealDetailResponse : DealSummaryResponse
{
    public string Description { get; init; } = "";
    public string? FinePrint { get; init; }
    public List<string> Highlights { get; init; } = new();
    public List<DealOptionResponse> Options { get; init; } = new();
    public List<DealImageResponse> Images { get; init; } = new();
    public int? QuantityTotal { get; init; }
    public int? QuantityLimit { get; init; }
    public int VoucherValidity { get; init; }
    public string Status { get; init; } = "";
    public string StartsAt { get; init; } = "";
    public Guid VendorId { get; init; }
}

public record DealOptionResponse(Guid Id, string Title, string? Description, decimal Price, int? AvailableQty);
public record DealImageResponse(string Url, string? AltText, bool IsPrimary);
public record PaginatedDealsResponse(IEnumerable<DealSummaryResponse> Items, int TotalCount, int Page, int PageSize, int TotalPages);

// ─── Queries ─────────────────────────────────────────────────

public record GetDealsQuery(
    int Page = 1, int PageSize = 20,
    string? Category = null, string? City = null,
    decimal? MinPrice = null, decimal? MaxPrice = null, decimal? MinDiscount = null,
    string? Sort = "relevance", bool? Featured = null, string? Search = null
) : IRequest<PaginatedDealsResponse>;

public record GetDealBySlugQuery(string Slug) : IRequest<DealDetailResponse?>;
public record GetFeaturedDealsQuery(int Count = 10) : IRequest<IEnumerable<DealSummaryResponse>>;
public record GetTrendingDealsQuery(int Count = 10) : IRequest<IEnumerable<DealSummaryResponse>>;
public record GetExpiringSoonDealsQuery(int Hours = 24) : IRequest<IEnumerable<DealSummaryResponse>>;

// ─── Handlers ────────────────────────────────────────────────

public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, PaginatedDealsResponse>
{
    private readonly IDealRepository _deals;
    private readonly IMapper _mapper;

    public GetDealsQueryHandler(IDealRepository deals, IMapper mapper)
    {
        _deals = deals;
        _mapper = mapper;
    }

    public async Task<PaginatedDealsResponse> Handle(GetDealsQuery req, CancellationToken ct)
    {
        var filter = new DealsFilter
        {
            Page = req.Page, PageSize = req.PageSize,
            Category = req.Category, City = req.City,
            MinPrice = req.MinPrice, MaxPrice = req.MaxPrice, MinDiscount = req.MinDiscount,
            Sort = req.Sort, Featured = req.Featured, Search = req.Search,
        };

        var (items, total) = await _deals.GetPagedAsync(filter, ct);
        var mapped = _mapper.Map<IEnumerable<DealSummaryResponse>>(items);
        var pages = (int)Math.Ceiling(total / (double)req.PageSize);
        return new PaginatedDealsResponse(mapped, total, req.Page, req.PageSize, pages);
    }
}

public class GetDealBySlugQueryHandler : IRequestHandler<GetDealBySlugQuery, DealDetailResponse?>
{
    private readonly IDealRepository _deals;
    private readonly IMapper _mapper;

    public GetDealBySlugQueryHandler(IDealRepository deals, IMapper mapper)
    {
        _deals = deals;
        _mapper = mapper;
    }

    public async Task<DealDetailResponse?> Handle(GetDealBySlugQuery req, CancellationToken ct)
    {
        var deal = await _deals.GetBySlugAsync(req.Slug, ct);
        return deal is null ? null : _mapper.Map<DealDetailResponse>(deal);
    }
}

public class GetFeaturedDealsQueryHandler : IRequestHandler<GetFeaturedDealsQuery, IEnumerable<DealSummaryResponse>>
{
    private readonly IDealRepository _deals;
    private readonly IMapper _mapper;

    public GetFeaturedDealsQueryHandler(IDealRepository deals, IMapper mapper)
    {
        _deals = deals;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DealSummaryResponse>> Handle(GetFeaturedDealsQuery req, CancellationToken ct)
        => _mapper.Map<IEnumerable<DealSummaryResponse>>(await _deals.GetFeaturedAsync(req.Count, ct));
}

public class GetTrendingDealsQueryHandler : IRequestHandler<GetTrendingDealsQuery, IEnumerable<DealSummaryResponse>>
{
    private readonly IDealRepository _deals;
    private readonly IMapper _mapper;

    public GetTrendingDealsQueryHandler(IDealRepository deals, IMapper mapper) { _deals = deals; _mapper = mapper; }

    public async Task<IEnumerable<DealSummaryResponse>> Handle(GetTrendingDealsQuery req, CancellationToken ct)
        => _mapper.Map<IEnumerable<DealSummaryResponse>>(await _deals.GetTrendingAsync(req.Count, ct));
}

public class GetExpiringSoonDealsQueryHandler : IRequestHandler<GetExpiringSoonDealsQuery, IEnumerable<DealSummaryResponse>>
{
    private readonly IDealRepository _deals;
    private readonly IMapper _mapper;

    public GetExpiringSoonDealsQueryHandler(IDealRepository deals, IMapper mapper) { _deals = deals; _mapper = mapper; }

    public async Task<IEnumerable<DealSummaryResponse>> Handle(GetExpiringSoonDealsQuery req, CancellationToken ct)
        => _mapper.Map<IEnumerable<DealSummaryResponse>>(await _deals.GetExpiringSoonAsync(req.Hours, ct));
}
