using System.Threading.Tasks;
using CM.Business.Entities.Models.AdHocReport;
using CM.Common.Utilities;
using CM.WebAPI.Configuration;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/adhocdlreport")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class AdHocReportController : BaseController
{
    private readonly ServiceList _services;

    public AdHocReportController(IOptions<ServiceList> servicesAccessor)
    {
        _services = servicesAccessor.Value;
    }

    [HttpPost("downloadreport")]
    public async Task<IActionResult> PostAdHocDlReport(AdHocDlReportRequest request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocDlReportResponse>(endpoint, "POST", "downloadreport", request);
    }

    [HttpPatch("downloadreport/{adHocDlReportId:long}")]
    public async Task<IActionResult> PatchAdHocDlReport(long adHocDlReportId, [FromBody] JsonPatchDocumentExtension<AdHocDlReportRequest> request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocDlReportResponse>(endpoint, "PATCH", $"downloadreport/{adHocDlReportId}", request);
    }

    [HttpDelete("downloadreport/{adHocDlReportId:long}")]
    public async Task<IActionResult> DeleteAdHocDlReport(int adHocDlReportId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "DELETE", $"downloadreport/{adHocDlReportId}");
    }

    [HttpGet("downloadreport/{adHocDlReportId:long}")]
    public async Task<IActionResult> GetAdHocDlReport(int adHocDlReportId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "GET", $"downloadreport/{adHocDlReportId}");
    }

    [HttpGet("downloadreports")]
    public async Task<IActionResult> GetAdHocDlReports(int count, int index, AdHocGetFilter filter)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await GetRequest(endpoint, "downloadreports", count, index, filter.ToDictionary());
    }

    [HttpPost("reportemail")]
    public async Task<IActionResult> PostAdHocEmailReport(AdHocReportEmailRequest request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocReportEmailResponse>(endpoint, "POST", "reportemail", request);
    }

    [HttpPatch("reportemail/{adHocReportId:long}")]
    public async Task<IActionResult> PatchAdHocEmailReport(long adHocReportId, [FromBody] JsonPatchDocumentExtension<AdHocReportEmailPatchRequest> request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocReportEmailResponse>(endpoint, "PATCH", $"reportemail/{adHocReportId}", request);
    }

    [HttpDelete("reportemail/{adHocReportId:long}")]
    public async Task<IActionResult> DeleteAdHocEmailReport(long adHocReportId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "DELETE", $"reportemail/{adHocReportId}");
    }

    [HttpPost("reportemailattachment/{adHocReportId:long}")]
    public async Task<IActionResult> PostAdHocEmailAttachmentReport(long adHocReportId, AdHocReportAttachmentRequest request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocReportAttachmentResponse>(endpoint, "POST", $"reportemailattachment/{adHocReportId}", request);
    }

    [HttpPatch("reportemailattachment/{adHocReportAttachmentId:long}")]
    public async Task<IActionResult> PatchAdHocAttachmentReport(long adHocReportAttachmentId, AdHocReportAttachmentPatchRequest request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await SendRequest<AdHocReportAttachmentResponse>(endpoint, "PATCH", $"reportemailattachment/{adHocReportAttachmentId}", request);
    }

    [HttpDelete("reportemailattachment/{adHocReportAttachmentId:long}")]
    public async Task<IActionResult> DeleteAdHocAttachmentReport(long adHocReportAttachmentId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "DELETE", $"reportemailattachment/{adHocReportAttachmentId}");
    }

    [HttpGet("reportemail/{adHocReportId:long}")]
    public async Task<IActionResult> GetAdHocReport(long adHocReportId)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "GET", $"reportemail/{adHocReportId}");
    }

    [HttpGet("reportemails")]
    public async Task<IActionResult> GetAdHocReports(AdHocReportGetFilter filter)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await GetRequest(endpoint, "reportemails", null, null, filter.ToDictionary());
    }

    [HttpGet]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetList()
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequest(endpoint, "GET", "adhocreport");
    }

    [HttpPost("{adhocDlReportId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get([FromRoute]int adhocDlReportId, [FromBody]AdHocReportRequest request)
    {
        var endpoint = _services.GetServiceUri(ServiceNames.AdHocReport);
        return await MakeRequestWithAttachment(endpoint, "POST", $"adhocreport/{adhocDlReportId}", request);
    }
}