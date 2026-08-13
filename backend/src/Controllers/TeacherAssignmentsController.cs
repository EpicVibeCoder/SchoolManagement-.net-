using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/teacher-assignments")]
[Authorize]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly ITeacherAssignmentService _teacherAssignmentService;

    public TeacherAssignmentsController(ITeacherAssignmentService teacherAssignmentService) => _teacherAssignmentService = teacherAssignmentService;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<TeacherAssignmentDto>>> List([FromQuery] Guid? teacherId, [FromQuery] Guid? classId, CancellationToken ct)
    {
        var result = await _teacherAssignmentService.ListAsync(teacherId, classId, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeacherAssignmentDto>> Create(CreateTeacherAssignmentRequest request, CancellationToken ct)
    {
        var result = await _teacherAssignmentService.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _teacherAssignmentService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<List<TeacherClassSubjectDto>>> Mine(CancellationToken ct)
    {
        var result = await _teacherAssignmentService.ListMineAsync(ct);
        return Ok(result);
    }
}
