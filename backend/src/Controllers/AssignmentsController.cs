using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ISubmissionService _submissionService;

    public AssignmentsController(IAssignmentService assignmentService, ISubmissionService submissionService)
    {
        _assignmentService = assignmentService;
        _submissionService = submissionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AssignmentDto>>> List(
        [FromQuery] Guid? classId, [FromQuery] Guid? subjectId, CancellationToken ct)
    {
        var result = await _assignmentService.ListAsync(classId, subjectId, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AssignmentDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await _assignmentService.GetAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<AssignmentDto>> Create(CreateAssignmentRequest request, CancellationToken ct)
    {
        var result = await _assignmentService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<AssignmentDto>> Update(Guid id, UpdateAssignmentRequest request, CancellationToken ct)
    {
        var result = await _assignmentService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _assignmentService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/publish")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<AssignmentDto>> Publish(Guid id, CancellationToken ct)
    {
        var result = await _assignmentService.PublishAsync(id, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/unpublish")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<AssignmentDto>> Unpublish(Guid id, CancellationToken ct)
    {
        var result = await _assignmentService.UnpublishAsync(id, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/submissions")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<ActionResult<List<SubmissionDto>>> Submissions(Guid id, CancellationToken ct)
    {
        var result = await _submissionService.ListByAssignmentAsync(id, ct);
        return Ok(result);
    }
}
