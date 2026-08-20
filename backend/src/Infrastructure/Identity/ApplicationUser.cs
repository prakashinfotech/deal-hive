using Microsoft.AspNetCore.Identity;
using GrouponClone.Domain.Enums;

namespace GrouponClone.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public UserRole Role { get; set; } = UserRole.Consumer;
    public bool IsEmailVerified { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public string FullName => $"{FirstName} {LastName}";

    public Domain.Entities.User ToDomainUser() => new(
        Id, Email!, FirstName, LastName, Role, IsEmailVerified, AvatarUrl);
}
