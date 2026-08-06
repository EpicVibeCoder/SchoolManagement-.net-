using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService) => _settingsService = settingsService;

    [HttpGet]
    public async Task<ActionResult<List<AppSettingDto>>> GetAll(CancellationToken ct)
    {
        var result = await _settingsService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<AppSettingDto>> Update(string key, UpdateSettingRequest request, CancellationToken ct)
    {
        var result = await _settingsService.UpdateAsync(key, request, ct);
        return Ok(result);
    }
}
