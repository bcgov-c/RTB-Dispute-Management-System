using System;
using System.Threading.Tasks;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.Reconciliation;
using CM.Business.Services.Scheduling;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/test")]
public class TestController : BaseController
{
    [HttpPost("egarms")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public IActionResult Test([FromServices] IReconciliationService reconciliationService)
    {
        reconciliationService.BuildReport();

        return Ok("Reconciliation Service invoked");
    }

    [HttpPost("emailmessage")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public IActionResult Test([FromServices] IEmailMessageService emailMessageService, Guid disputeGuid, AssignedTemplate assignedTemplateId, int messageType)
    {
        var result = emailMessageService.TestTemplates(disputeGuid, assignedTemplateId, messageType);

        return Ok(result);
    }

    [HttpPost("runjob/{jobName}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> RunJob([FromServices] ISchedulingService schedulingService, string jobName)
    {
        var result = await schedulingService.RubJob(jobName);

        return Ok(result);
    }

    [HttpPost("encrypt")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Encrypt([FromServices] ISystemSettingsService systemSettingsService, string value, string salt)
    {
        var result = await systemSettingsService.Encrypt(value, salt);

        return Ok(result);
    }
}