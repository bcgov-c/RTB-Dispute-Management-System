using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Controllers;

[Produces(MediaTypeNames.Application.Json)]
[Route("[controller]")]
public class HealthController : Controller
{
    [HttpGet]
    public IActionResult Get() => Ok("ok");
}