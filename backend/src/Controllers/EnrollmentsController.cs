using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize(Roles = "Admin")]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService) => _enrollmentService = enrollmentService;

    [HttpGet]
    public async Task<ActionResult<List<EnrollmentDto>>> List(
        [FromQuery] Guid? studentId, [FromQuery] Guid? classId, CancellationToken ct)
    {
        var result = await _enrollmentService.ListAsync(studentId, classId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<EnrollmentDto>> Create(CreateEnrollmentRequest request, CancellationToken ct)
    {
        var result = await _enrollmentService.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _enrollmentService.DeleteAsync(id, ct);
        return NoContent();
    }
}
