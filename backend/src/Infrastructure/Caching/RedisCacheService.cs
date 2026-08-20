using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using GrouponClone.Application.Interfaces;
using StackExchange.Redis;

namespace GrouponClone.Infrastructure.Caching;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer _redis;

    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public RedisCacheService(IDistributedCache cache, IConnectionMultiplexer redis)
    {
        _cache = cache;
        _redis = redis;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        var bytes = await _cache.GetAsync(key, ct);
        return bytes is null ? null : JsonSerializer.Deserialize<T>(bytes, _json);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default) where T : class
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(value, _json);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiry ?? TimeSpan.FromMinutes(10),
        };
        await _cache.SetAsync(key, bytes, options, ct);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
        => await _cache.RemoveAsync(key, ct);

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        var keys = server.Keys(pattern: $"{prefix}*").ToArray();
        if (keys.Length > 0)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(keys);
        }
    }
}
