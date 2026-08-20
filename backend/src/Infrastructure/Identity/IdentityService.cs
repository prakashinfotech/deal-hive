using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Enums;

namespace GrouponClone.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public IdentityService(UserManager<ApplicationUser> userManager) => _userManager = userManager;

    public async Task<(bool Succeeded, string? Error, Guid UserId)> CreateUserAsync(
        string email, string password, string firstName, string lastName, UserRole role = UserRole.Consumer)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Role = role,
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            return (false, string.Join(", ", result.Errors.Select(e => e.Description)), Guid.Empty);

        return (true, null, user.Id);
    }

    public async Task<(bool Succeeded, Guid UserId, string Role, Domain.Entities.User? DomainUser)> CheckPasswordAsync(
        string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || user.DeletedAt.HasValue)
            return (false, Guid.Empty, string.Empty, null);

        var valid = await _userManager.CheckPasswordAsync(user, password);
        if (!valid)
            return (false, Guid.Empty, string.Empty, null);

        return (true, user.Id, user.Role.ToString(), user.ToDomainUser());
    }

    public async Task<string> GenerateEmailVerificationTokenAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException("User not found.");
        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    public async Task<(bool Succeeded, string? Error)> VerifyEmailAsync(Guid userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return (false, "User not found.");

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded) user.IsEmailVerified = true;
        return result.Succeeded
            ? (true, null)
            : (false, string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return null;
        return await _userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<(bool Succeeded, string? Error)> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return (false, "User not found.");

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded
            ? (true, null)
            : (false, string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<bool> UserExistsAsync(string email)
        => await _userManager.Users.AnyAsync(u => u.Email == email);

    public async Task<Domain.Entities.User?> GetByIdAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.ToDomainUser();
    }

    public async Task<(bool Succeeded, string? Error)> UpdateProfileAsync(
        Guid userId, string firstName, string lastName, string? phoneNumber)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return (false, "User not found.");

        user.FirstName = firstName;
        user.LastName = lastName;
        user.PhoneNumber = phoneNumber;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded
            ? (true, null)
            : (false, string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<(bool Succeeded, string? Error)> ChangePasswordAsync(
        Guid userId, string currentPassword, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return (false, "User not found.");

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return result.Succeeded
            ? (true, null)
            : (false, string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<(bool Succeeded, string? Error)> AssignRoleAsync(Guid userId, UserRole role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return (false, "User not found.");

        user.Role = role;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded
            ? (true, null)
            : (false, string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}
