using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize(Roles = "Admin")]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService) => _subjectService = subjectService;

    [HttpGet]
    public async Task<ActionResult<List<SubjectDto>>> List(CancellationToken ct)
    {
        var result = await _subjectService.ListAsync( ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubjectDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await _subjectService.GetAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SubjectDto>> Create(CreateSubjectRequest request, CancellationToken ct)
    {
        var result = await _subjectService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SubjectDto>> Update(Guid id, UpdateSubjectRequest request, CancellationToken ct)
    {
        var result = await _subjectService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _subjectService.DeleteAsync(id, ct);
        return NoContent();
    }
}
