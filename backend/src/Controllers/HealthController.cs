using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[DisableRateLimiting]
public class HealthController : ControllerBase
{
    [HttpGet,HttpHead]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            message = "API is running"
        });
    }
}