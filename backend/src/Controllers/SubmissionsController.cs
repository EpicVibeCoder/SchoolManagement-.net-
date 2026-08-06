using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/submissions")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;

    public SubmissionsController(ISubmissionService submissionService) => _submissionService = submissionService;

    [HttpGet("mine")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<SubmissionDto>>> Mine(CancellationToken ct)
    {
        var result = await _submissionService.MineAsync(ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<SubmissionDto>> Create(CreateSubmissionRequest request, CancellationToken ct)
    {
        var result = await _submissionService.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<SubmissionDto>> Update(Guid id, UpdateSubmissionRequest request, CancellationToken ct)
    {
        var result = await _submissionService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/grade")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<SubmissionDto>> Grade(Guid id, GradeSubmissionRequest request, CancellationToken ct)
    {
        var result = await _submissionService.GradeAsync(id, request, ct);
        return Ok(result);
    }
}
