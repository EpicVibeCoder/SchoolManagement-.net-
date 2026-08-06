using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface INotificationService
{
    Task<List<NotificationDto>> ListMineAsync(CancellationToken ct);
    Task MarkReadAsync(Guid id, CancellationToken ct);
    Task<int> UnreadCountAsync(CancellationToken ct);
    Task CreateAsync(Guid userId, string type, string title, string body, CancellationToken ct);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public NotificationService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<NotificationDto>> ListMineAsync(CancellationToken ct) =>
        await _db.Notifications
            .Where(n => n.UserId == _currentUser.UserId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Body, n.IsRead, n.CreatedAt))
            .ToListAsync(ct);

    public async Task MarkReadAsync(Guid id, CancellationToken ct)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException("Notification not found.");

        notification.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> UnreadCountAsync(CancellationToken ct) =>
        await _db.Notifications.CountAsync(n => n.UserId == _currentUser.UserId && !n.IsRead, ct);

    public async Task CreateAsync(Guid userId, string type, string title, string body, CancellationToken ct)
    {
        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await _db.SaveChangesAsync(ct);
    }
}
