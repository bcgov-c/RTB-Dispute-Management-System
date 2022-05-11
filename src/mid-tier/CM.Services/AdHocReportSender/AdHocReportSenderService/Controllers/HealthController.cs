using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Controllers;

[Produces(Application.Json)]
[Route("api/[controller]")]
public class HealthController : Controller
{
    [HttpGet]
    public IActionResult Get() => Ok("ok");
}