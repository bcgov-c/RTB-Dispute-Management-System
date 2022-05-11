using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace CM.Services.EmailGenerator.EmailGeneratorService.Controllers;

[Produces(MediaTypeNames.Application.Json)]
[Route("api/[controller]")]
public class HealthController : Controller
{
    [HttpGet]
    public IActionResult Get() => Ok("ok");
}