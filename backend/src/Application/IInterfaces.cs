// ============================================================
// GrouponClone.Application — Core Interfaces
// ============================================================

using GrouponClone.Domain.Entities;
using System.Linq.Expressions;

namespace GrouponClone.Application.Interfaces;

// ─── Repository Pattern ──────────────────────────────────────

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitTransactionAsync(CancellationToken ct = default);
    Task RollbackTransactionAsync(CancellationToken ct = default);
}

// ─── Deal Repository ─────────────────────────────────────────

public interface IDealRepository : IRepository<Deal>
{
    Task<Deal?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<(IEnumerable<Deal> Items, int TotalCount)> GetPagedAsync(
        DealsFilter filter, CancellationToken ct = default);
    Task<IEnumerable<Deal>> GetFeaturedAsync(int count = 10, CancellationToken ct = default);
    Task<IEnumerable<Deal>> GetTrendingAsync(int count = 10, CancellationToken ct = default);
    Task<IEnumerable<Deal>> GetExpiringSoonAsync(int hours = 24, CancellationToken ct = default);
    Task<IEnumerable<Deal>> GetByVendorAsync(Guid vendorId, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default);
}

// ─── Auth / JWT ──────────────────────────────────────────────

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    Task<string> GenerateRefreshTokenAsync(Guid userId, CancellationToken ct = default);
    Task<(bool IsValid, Guid UserId)> ValidateRefreshTokenAsync(string token, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default);
    Task RevokeAllUserTokensAsync(Guid userId, CancellationToken ct = default);
}

// ─── Stripe ──────────────────────────────────────────────────

public interface IStripeService
{
    Task<string> CreatePaymentIntentAsync(Guid orderId, decimal amount, string currency,
        Dictionary<string, string>? metadata = null, CancellationToken ct = default);
    Task<string> CreateConnectedAccountAsync(string email, string businessName, CancellationToken ct = default);
    Task<string> TransferToVendorAsync(string vendorStripeAccountId, long amountCents,
        string currency, CancellationToken ct = default);
    Task<string> RefundPaymentAsync(string paymentIntentId, long? amountCents = null,
        CancellationToken ct = default);
    Stripe.Event ConstructWebhookEvent(string payload, string signature, string secret);
}

// ─── Email ───────────────────────────────────────────────────

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, string firstName, string orderNumber,
        decimal total, CancellationToken ct = default);
    Task SendVoucherAsync(string toEmail, string firstName, IEnumerable<VoucherEmailDto> vouchers,
        CancellationToken ct = default);
    Task SendEmailVerificationAsync(string toEmail, string firstName, string token,
        CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string firstName, string token,
        CancellationToken ct = default);
    Task SendDealApprovalAsync(string toEmail, string businessName, string dealTitle, bool approved,
        string? reason = null, CancellationToken ct = default);
}

public record VoucherEmailDto(string Code, string DealTitle, string VendorName, DateTime ExpiresAt);

// ─── Cache ───────────────────────────────────────────────────

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default) where T : class;
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);
}

// ─── Storage ─────────────────────────────────────────────────

public interface IStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType,
        string container = "dealhive-media", CancellationToken ct = default);
    Task DeleteAsync(string fileUrl, CancellationToken ct = default);
}

// ─── Current User ────────────────────────────────────────────

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}

// ─── Voucher Generator ───────────────────────────────────────

public interface IVoucherCodeGenerator
{
    string Generate(string prefix = "DH");
}

// ─── Search ──────────────────────────────────────────────────

public interface ISearchService
{
    Task IndexDealAsync(Deal deal, CancellationToken ct = default);
    Task RemoveDealFromIndexAsync(Guid dealId, CancellationToken ct = default);
}

// ─── Filter DTO ──────────────────────────────────────────────

public record DealsFilter
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Category { get; init; }
    public string? City { get; init; }
    public double? Lat { get; init; }
    public double? Lng { get; init; }
    public double? RadiusKm { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public decimal? MinDiscount { get; init; }
    public string? Sort { get; init; } = "relevance";
    public bool? Featured { get; init; }
    public string? Search { get; init; }
}
