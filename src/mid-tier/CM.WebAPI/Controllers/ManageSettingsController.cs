using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;

namespace CM.WebAPI.Controllers;

public class ManageSettingsController : Controller
{
    [ApiAuthenticationFilter]
    public IActionResult Index()
    {
        return View();
    }
}