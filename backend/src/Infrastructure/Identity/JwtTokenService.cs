using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Infrastructure.Persistence;

namespace GrouponClone.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;
    private readonly ApplicationDbContext _db;

    public JwtTokenService(IConfiguration config, ApplicationDbContext db)
    {
        _config = config;
        _db = db;
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var expiry = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var mins) ? mins : 15;

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> GenerateRefreshTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(64);
        var tokenStr = Convert.ToBase64String(tokenBytes);

        var expiryDays = int.TryParse(_config["Jwt:RefreshTokenDays"], out var days) ? days : 7;
        var refreshToken = RefreshToken.Create(userId, tokenStr, expiryDays);

        await _db.RefreshTokens.AddAsync(refreshToken, ct);
        await _db.SaveChangesAsync(ct);

        return tokenStr;
    }

    public async Task<(bool IsValid, Guid UserId)> ValidateRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var stored = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == token, ct);

        if (stored is null || !stored.IsActive)
            return (false, Guid.Empty);

        // Reuse detection: revoke entire family
        if (stored.IsRevoked)
        {
            var family = await _db.RefreshTokens
                .Where(r => r.FamilyId == stored.FamilyId)
                .ToListAsync(ct);
            family.ForEach(r => r.Revoke());
            await _db.SaveChangesAsync(ct);
            return (false, Guid.Empty);
        }

        return (true, stored.UserId);
    }

    public async Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token, ct);
        if (stored is null) return;
        stored.Revoke();
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeAllUserTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var tokens = await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null)
            .ToListAsync(ct);
        tokens.ForEach(t => t.Revoke());
        await _db.SaveChangesAsync(ct);
    }
}
