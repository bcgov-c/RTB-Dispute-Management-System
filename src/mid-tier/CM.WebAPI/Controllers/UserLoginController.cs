using System.Threading.Tasks;
using CM.Business.Entities.Models.User;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/userlogin")]
public class UserLoginController : BaseController
{
    private readonly IUserService _userService;

    public UserLoginController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("create")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Create([FromBody]UserLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.Scheduler && request.SystemUserRoleId != (byte)Roles.StaffUser)
        {
            return BadRequest(ApiReturnMessages.SchedulerOnlyForStaffUsers);
        }

        var validationMessage = await _userService.CheckUserUnique(request.AccountEmail, request.Username, request.SystemUserRoleId);

        if (validationMessage == string.Empty)
        {
            var newUser = await _userService.CreateUser(request);
            EntityIdSetContext(newUser.SystemUserId);
            return Ok(newUser);
        }

        return BadRequest(validationMessage);
    }

    [HttpPatch("update/{userId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    public async Task<IActionResult> Update(int userId, [FromBody]JsonPatchDocumentExtension<UserLoginPatchRequest> request)
    {
        var loggedInUser = await _userService.GetSystemUser(GetLoggedInUserId());

        if (userId != GetLoggedInUserId())
        {
            if (loggedInUser.AdminAccess != true ||
                loggedInUser.SystemUserRole.SystemUserRoleId != (byte)Roles.StaffUser)
            {
                return Unauthorized();
            }
        }

        var userToPatch = await _userService.GetUserLoginPatchRequest(userId);
        if (userToPatch != null)
        {
            request.ApplyTo(userToPatch);

            var scheduler = request.GetValue<int>("/scheduler");
            if (scheduler.Exists)
            {
                if (userToPatch.SystemUserRoleId != (byte)Roles.StaffUser)
                {
                    return BadRequest(ApiReturnMessages.SchedulerOnlyForStaffUsers);
                }
            }

            var dashboardAccess = request.GetValue<bool>("/dashboard_access");
            if (dashboardAccess.Exists)
            {
                if (userToPatch.SystemUserRoleId != (byte)Roles.StaffUser && userToPatch.AdminAccess != 1)
                {
                    return BadRequest(ApiReturnMessages.DashboardAccessOnlyAdminAccess);
                }
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.PatchLoginUserAsync(userId, userToPatch);

            if (result != null)
            {
                EntityIdSetContext(userId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpPatch("reset/{userId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    public async Task<IActionResult> Reset(int userId, [FromBody]JsonPatchDocumentExtension<UserLoginResetRequest> request)
    {
        var originalUser = await _userService.GetSystemUser(userId);
        if (originalUser != null)
        {
            var loggedInUser = await _userService.GetSystemUser(GetLoggedInUserId());
            if (loggedInUser.SystemUserRoleId == (int)Roles.ExternalUser && loggedInUser.SystemUserId != userId)
            {
                return Unauthorized();
            }

            var newVal = request.GetValue<string>("/password");
            if (newVal.Exists)
            {
                var result = await _userService.Reset(originalUser, newVal.Value);
                if (result)
                {
                    EntityIdSetContext(userId);
                    return Ok(ApiReturnMessages.Succeeded);
                }
            }
            else
            {
                return BadRequest();
            }
        }

        return NotFound();
    }
}