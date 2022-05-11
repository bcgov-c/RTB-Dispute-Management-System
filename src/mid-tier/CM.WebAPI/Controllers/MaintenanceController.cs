using System.Threading.Tasks;
using CM.Business.Services.Maintenance;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/scheduledmaintenance")]
public class MaintenanceController : BaseController
{
    private readonly IMaintenanceService _maintenanceService;

    public MaintenanceController(IMaintenanceService maintenanceService)
    {
        _maintenanceService = maintenanceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var maintenance = await _maintenanceService.GetAll();
        return Ok(maintenance);
    }
}