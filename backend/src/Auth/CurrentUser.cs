using System.Security.Claims;
using backend.Domain.Enums;

namespace backend.Auth;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Email { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
}

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _http;

    public CurrentUser(IHttpContextAccessor http) => _http = http;

    private ClaimsPrincipal? User => _http.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public Guid UserId =>
        Guid.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User?.FindFirstValue("sub"), out var id)
            ? id
            : throw new InvalidOperationException("User id claim missing.");

    public string Email =>
        User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email")
        ?? string.Empty;

    public UserRole Role =>
        Enum.TryParse<UserRole>(User?.FindFirstValue(ClaimTypes.Role), out var role)
            ? role
            : throw new InvalidOperationException("Role claim missing.");
}
