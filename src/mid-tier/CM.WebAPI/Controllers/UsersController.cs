using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.User;
using CM.Business.Services.TokenServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/users")]
public class UsersController : BaseController
{
    private readonly ITokenService _tokenService;
    private readonly IUserService _userService;

    public UsersController(IUserService userService, ITokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    [HttpPost("authenticate")]
    [ApiAuthenticationFilter]
    public IActionResult Authenticate()
    {
        var token = Response.GetTokenFromResponse();
        if (!string.IsNullOrWhiteSpace(token))
        {
            return Ok(ApiReturnMessages.Authorized);
        }

        return Unauthorized();
    }

    [HttpGet("currentuserinfo")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.OfficePay })]
    public async Task<IActionResult> GetCurrentUserInfo()
    {
        var userId = GetLoggedInUserId();
        var user = await _userService.GetUser(userId);
        return Ok(user);
    }

    [HttpGet("internaluserslist")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetInternalUserList()
    {
        var internalUsers = await _userService.GetInternalUsers();
        if (internalUsers != null)
        {
            return Ok(internalUsers);
        }

        return NotFound();
    }

    [HttpPatch("internaluserstatus/{userId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> PatchInternalUser(int userId, [FromBody]JsonPatchDocumentExtension<PatchUserRequest> user)
    {
        if (CheckModified(_userService, userId))
        {
            return StatusConflicted();
        }

        var userToPatch = await _userService.GetUserPatchRequest(userId);
        if (userToPatch != null)
        {
            user.ApplyTo(userToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.PatchUserAsync(userId, userToPatch);

            if (result != null)
            {
                EntityIdSetContext(userId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("sessioninformation")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.OfficePay })]
    public async Task<IActionResult> GetSessionInformation()
    {
        var token = Request.GetToken();
        var session = await _tokenService.GetSessionDuration(token);
        return Ok(session);
    }

    [HttpPost("extendsession")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> ExtendSession()
    {
        var token = Request.GetToken();
        if (!string.IsNullOrWhiteSpace(token))
        {
            var result = await _tokenService.ExtendSession(token);
            if (result != null)
            {
                return Ok(result);
            }
        }

        return Unauthorized();
    }

    [HttpPost("logout")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Logout()
    {
        var token = Request.GetToken();

        var result = await _tokenService.KillToken(token);
        if (result)
        {
            return NoContent();
        }

        return NotFound();
    }

    [HttpGet("disputeuserlist/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeUserList(Guid disputeGuid)
    {
        var disputeUsers = await _userService.GetDisputeUsers(disputeGuid);
        if (disputeUsers != null)
        {
            return Ok(disputeUsers);
        }

        return NotFound();
    }
}