using GrouponClone.Domain.Enums;

namespace GrouponClone.Domain.Entities;

/// <summary>Lightweight domain projection of a user — used for JWT generation and read queries.</summary>
public record User(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    bool IsEmailVerified,
    string? AvatarUrl)
{
    public string FullName => $"{FirstName} {LastName}";
}
