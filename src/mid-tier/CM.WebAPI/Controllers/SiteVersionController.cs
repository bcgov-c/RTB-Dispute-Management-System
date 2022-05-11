using System.Threading.Tasks;
using CM.Business.Services.SiteVersion;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/version")]
public class SiteVersionController : ControllerBase
{
    private readonly ISiteVersionService _siteVersionService;

    public SiteVersionController(ISiteVersionService siteVersionService)
    {
        _siteVersionService = siteVersionService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _siteVersionService.Get();
        if (result != null)
        {
            return Ok(result);
        }

        return NotFound();
    }
}