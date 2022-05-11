using System.Threading.Tasks;
using CM.Business.Entities.Models.Dashboard;
using CM.Business.Services.Dashboard;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class DashboardSearchController : BaseController
{
    private readonly IDashboardService _dashboardService;
    private readonly IUserService _userService;

    public DashboardSearchController(IDashboardService dashboardService, IUserService userService)
    {
        _dashboardService = dashboardService;
        _userService = userService;
    }

    [HttpGet("assignedhearings/{userId:int}")]
    public async Task<IActionResult> GetAssignedHearings(int userId, int count, int index, AssignedHearingsRequest request)
    {
        var user = await _userService.GetUser(userId);
        if (user?.IsActive == false || user?.SystemUserRoleId != (int)Roles.StaffUser)
        {
            return BadRequest(ApiReturnMessages.UserNotValidOrInactive);
        }

        var hearings = await _dashboardService.GetAssignedHearings(userId, count, index, request);
        if (hearings != null)
        {
            return Ok(hearings);
        }

        return NotFound();
    }

    [HttpGet("unassignedhearings")]
    public async Task<IActionResult> GetUnAssignedHearings(int count, int index, UnAssignedHearingsRequest request)
    {
        var hearings = await _dashboardService.GetUnAssignedHearings(count, index, request);
        if (hearings != null)
        {
            return Ok(hearings);
        }

        return NotFound();
    }

    [HttpGet("assigneddisputes/{userId:int}")]
    public async Task<IActionResult> GetAssignedDisputes(int userId, int count, int index, DashboardSearchDisputesRequest request)
    {
        var user = await _userService.GetUser(userId);
        if (user?.IsActive == false || user?.SystemUserRoleId != (int)Roles.StaffUser)
        {
            return BadRequest(ApiReturnMessages.UserNotValidOrInactive);
        }

        var disputes = await _dashboardService.GetAssignedDisputes(userId, count, index, request);
        if (disputes != null)
        {
            return Ok(disputes);
        }

        return NotFound();
    }

    [HttpGet("unassigneddisputes")]
    public async Task<IActionResult> GetUnAssignedDispute(int count, int index, DashboardSearchDisputesRequest request)
    {
        var disputes = await _dashboardService.GetUnAssignedDisputes(count, index, request);
        if (disputes != null)
        {
            return Ok(disputes);
        }

        return NotFound();
    }
}