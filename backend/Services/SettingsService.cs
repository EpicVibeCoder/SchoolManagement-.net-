using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface ISettingsService
{
    Task<List<AppSettingDto>> GetAllAsync(CancellationToken ct);
    Task<AppSettingDto> UpdateAsync(string key, UpdateSettingRequest request, CancellationToken ct);
    Task<bool> GetBoolAsync(string key, bool defaultValue, CancellationToken ct);
}

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _db;

    public SettingsService(AppDbContext db) => _db = db;

    public async Task<List<AppSettingDto>> GetAllAsync(CancellationToken ct) =>
        await _db.AppSettings
            .OrderBy(s => s.Key)
            .Select(s => new AppSettingDto(s.Key, s.Value))
            .ToListAsync(ct);

    public async Task<AppSettingDto> UpdateAsync(string key, UpdateSettingRequest request, CancellationToken ct)
    {
        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key, ct)
            ?? throw new NotFoundException($"Setting '{key}' not found.");

        setting.Value = request.Value;
        setting.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new AppSettingDto(setting.Key, setting.Value);
    }

    public async Task<bool> GetBoolAsync(string key, bool defaultValue, CancellationToken ct)
    {
        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key, ct);
        if (setting is null)
            return defaultValue;

        return bool.TryParse(setting.Value, out var value) ? value : defaultValue;
    }
}
