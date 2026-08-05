using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize(Roles = "Admin")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService) => _classService = classService;

    [HttpGet]
    public async Task<ActionResult<List<ClassDto>>> List(CancellationToken ct)
    {
        var result = await _classService.ListAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClassDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await _classService.GetAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ClassDto>> Create(CreateClassRequest request, CancellationToken ct)
    {
        var result = await _classService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClassDto>> Update(Guid id, UpdateClassRequest request, CancellationToken ct)
    {
        var result = await _classService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _classService.DeleteAsync(id, ct);
        return NoContent();
    }
}
