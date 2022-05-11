using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Hearings;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
public class HearingAuditLogController : ControllerBase
{
    private readonly IDisputeService _disputeService;
    private readonly IHearingAuditLogService _hearingAuditLogService;
    private readonly IHearingService _hearingService;
    private readonly IUserService _userService;

    public HearingAuditLogController(IHearingAuditLogService hearingAuditLogService, IHearingService hearingService, IUserService userService, IDisputeService disputeService)
    {
        _hearingAuditLogService = hearingAuditLogService;
        _hearingService = hearingService;
        _userService = userService;
        _disputeService = disputeService;
    }

    [HttpGet("api/audit/hearing")]
    public async Task<IActionResult> GetHearingAuditLogs(HearingAuditLogGetRequest request, int count, int index)
    {
        var validationResult = await ValidateRequestAsync(request);
        if (validationResult.GetType() != typeof(OkResult))
        {
            return validationResult;
        }

        var hearingAuditLogs = await _hearingAuditLogService.GetHearingAuditLogs(request, count, index);
        if (hearingAuditLogs != null)
        {
            return Ok(hearingAuditLogs);
        }

        return NotFound();
    }

    private async Task<IActionResult> ValidateRequestAsync(HearingAuditLogGetRequest request)
    {
        switch (request.SearchType)
        {
            case 1:
                if (!request.HearingId.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchType1);
                }
                else
                {
                    var isExist = await _hearingService.HearingExists(request.HearingId.Value);

                    if (!isExist)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.HearingAuditLogSearchType1Exists, request.HearingId.Value));
                    }
                }

                break;
            case 2:
                if (!request.DisputeGuid.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchType2);
                }
                else
                {
                    var isExist = await _disputeService.DisputeExistsAsync(request.DisputeGuid.Value);

                    if (!isExist)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.HearingAuditLogSearchType2Exists, request.DisputeGuid.Value));
                    }
                }

                break;
            case 3:
                if (!request.HearingOwner.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchType3);
                }
                else if (!request.StartDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeStartDateRequired);
                }
                else if (!request.EndDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeEndDateRequired);
                }
                else
                {
                    var isExist = await _userService.UserExists(request.HearingOwner.Value);

                    if (!isExist)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.HearingAuditLogSearchType3Exists, request.HearingOwner.Value));
                    }
                }

                break;
            case 4:
                if (!request.CreatedBy.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchType4);
                }
                else if (!request.StartDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeStartDateRequired);
                }
                else if (!request.EndDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeEndDateRequired);
                }
                else
                {
                    var isExist = await _userService.UserExists(request.CreatedBy.Value);

                    if (!isExist)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.HearingAuditLogSearchType4Exists, request.CreatedBy.Value));
                    }
                }

                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                if (!request.StartDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeStartDateRequired);
                }
                else if (!request.EndDate.HasValue)
                {
                    return BadRequest(ApiReturnMessages.HearingAuditLogSearchTypeEndDateRequired);
                }

                break;
        }

        return new OkResult();
    }
}