using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IUserService
{
    Task<PagedResult<UserDto>> ListAsync(string? search, UserRole? role, int page, int pageSize, CancellationToken ct);
    Task<UserDto> GetAsync(Guid id, CancellationToken ct);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct);
    Task DeactivateAsync(Guid id, CancellationToken ct);
}

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db) => _db = db;

    public async Task<PagedResult<UserDto>> ListAsync(
        string? search, UserRole? role, int page, int pageSize, CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 200 ? 20 : pageSize;

        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(term) || u.FullName.ToLower().Contains(term));
        }

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(u => u.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<UserDto>(items.Select(ToDto).ToList(), total, page, pageSize);
    }

    public async Task<UserDto> GetAsync(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User not found.");

        return ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email, ct);
        if (exists)
            throw new AppException("A user with this email already exists.", 409, "conflict");

        var now = DateTimeOffset.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim(),
            PasswordHash = PasswordHasher.Hash(request.Password),
            FullName = request.FullName.Trim(),
            Role = request.Role,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User not found.");

        user.FullName = request.FullName.Trim();
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = PasswordHasher.Hash(request.Password);
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToDto(user);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User not found.");

        user.IsActive = false;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Email, u.FullName, u.Role, u.IsActive, u.CreatedAt);
}
