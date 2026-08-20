using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using GrouponClone.Application.Interfaces;

namespace GrouponClone.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserService(IHttpContextAccessor http) => _http = http;

    private ClaimsPrincipal? Principal => _http.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? Principal?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email => Principal?.FindFirstValue(ClaimTypes.Email)
                         ?? Principal?.FindFirstValue("email");

    public string? Role => Principal?.FindFirstValue(ClaimTypes.Role);

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;
}
