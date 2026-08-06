using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<UserDto> MeAsync(CancellationToken ct);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ICurrentUser _currentUser;

    public AuthService(AppDbContext db, JwtTokenService jwtTokenService, ICurrentUser currentUser)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
        _currentUser = currentUser;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email, ct);

        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAppException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAppException("This account has been deactivated.");

        var token = _jwtTokenService.CreateToken(user);
        return new LoginResponse(token, ToDto(user));
    }

    public async Task<UserDto> MeAsync(CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        return ToDto(user);
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Email, u.FullName, u.Role, u.IsActive, u.CreatedAt);
}
