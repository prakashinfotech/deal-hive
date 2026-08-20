using GrouponClone.Domain.Entities;
using GrouponClone.Domain.Enums;

namespace GrouponClone.Application.Interfaces;

public interface IIdentityService
{
    Task<(bool Succeeded, string? Error, Guid UserId)> CreateUserAsync(
        string email, string password, string firstName, string lastName,
        UserRole role = UserRole.Consumer);

    Task<(bool Succeeded, Guid UserId, string Role, User? DomainUser)> CheckPasswordAsync(
        string email, string password);

    Task<string> GenerateEmailVerificationTokenAsync(Guid userId);
    Task<(bool Succeeded, string? Error)> VerifyEmailAsync(Guid userId, string token);

    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<(bool Succeeded, string? Error)> ResetPasswordAsync(string email, string token, string newPassword);

    Task<bool> UserExistsAsync(string email);
    Task<User?> GetByIdAsync(Guid userId);

    Task<(bool Succeeded, string? Error)> UpdateProfileAsync(
        Guid userId, string firstName, string lastName, string? phoneNumber);

    Task<(bool Succeeded, string? Error)> ChangePasswordAsync(
        Guid userId, string currentPassword, string newPassword);

    Task<(bool Succeeded, string? Error)> AssignRoleAsync(Guid userId, UserRole role);
}
