using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Services.AuditLogs;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class AuditLogController : Controller
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet("api/audit/logitems/{disputeGuid:Guid}")]
    public async Task<IActionResult> GetAll(Guid disputeGuid, int index, int count, byte? showErrors, byte? callType)
    {
        var auditLogs = await _auditLogService.GetAllAsync(disputeGuid, index, count, showErrors, callType);
        if (auditLogs != null)
        {
            return Ok(auditLogs.OrderByDescending(a => a.ChangeDate));
        }

        return NotFound();
    }

    [HttpGet("api/audit/itemdata/{auditItemId:int}")]
    public async Task<IActionResult> Get(int auditItemId)
    {
        var auditLog = await _auditLogService.GetAsync(auditItemId);
        if (auditLog != null)
        {
            return Ok(auditLog);
        }

        return NotFound();
    }
}