using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.WebAPI.Configuration;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/adhocdlreport")]
public class AdHocReportController : BaseController
{
    private readonly ServiceList _services;

    public AdHocReportController(IOptions<ServiceList> servicesAccessor)
    {
        _services = servicesAccessor.Value;
    }

    [HttpGet]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetList()
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "GET", "adhocreport");
    }

    [HttpGet("{adhocDlReportId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int adhocDlReportId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequestWithAttachment(endpoint, "GET", $"adhocreport/{adhocDlReportId}");
    }
}