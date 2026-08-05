using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/teacher-assignments")]
[Authorize(Roles = "Admin")]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly ITeacherAssignmentService _teacherAssignmentService;

    public TeacherAssignmentsController(ITeacherAssignmentService teacherAssignmentService) =>
        _teacherAssignmentService = teacherAssignmentService;

    [HttpGet]
    public async Task<ActionResult<List<TeacherAssignmentDto>>> List(
        [FromQuery] Guid? teacherId, [FromQuery] Guid? classId, CancellationToken ct)
    {
        var result = await _teacherAssignmentService.ListAsync(teacherId, classId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TeacherAssignmentDto>> Create(CreateTeacherAssignmentRequest request, CancellationToken ct)
    {
        var result = await _teacherAssignmentService.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _teacherAssignmentService.DeleteAsync(id, ct);
        return NoContent();
    }
}
