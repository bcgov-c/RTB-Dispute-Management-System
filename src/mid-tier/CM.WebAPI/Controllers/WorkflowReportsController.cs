using System;
using System.Threading.Tasks;
using CM.Business.Services.WorkflowReports;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;

namespace CM.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class WorkflowReportsController : ControllerBase
{
    private readonly IWorkflowReportsService _workflowReportsService;

    public WorkflowReportsController(IWorkflowReportsService workflowReportsService)
    {
        _workflowReportsService = workflowReportsService;
    }

    [HttpGet("incompletedisputeitems/{disputeGuid:Guid}")]
    public async Task<IActionResult> Get(Guid disputeGuid)
    {
        var result = await _workflowReportsService.GetReport(disputeGuid);
        if (result != null)
        {
            return Ok(result);
        }

        return NotFound();
    }
}