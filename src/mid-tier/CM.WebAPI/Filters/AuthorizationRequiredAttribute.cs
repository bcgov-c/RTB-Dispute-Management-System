using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CM.Business.Services.RoleService;
using CM.Business.Services.TokenServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.ServiceBase.Exceptions;
using CM.WebAPI.Authorization;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Filters;

public class AuthorizationRequiredAttribute : ActionFilterAttribute
{
    public AuthorizationRequiredAttribute(string[] roles = null)
    {
        Roles = roles;
    }

    private string[] Roles { get; }

    public override async System.Threading.Tasks.Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        try
        {
            var(userId, role) = await GetEffectiveUserAndRole(context);

            if (Roles == null || role == null || userId == 0)
            {
                throw new NotAuthorizedException();
            }

            var disputeGuidToken = context.HttpContext.Request.Headers[ApiHeader.DisputeGuidToken];
            Guid.TryParse(disputeGuidToken.ToString(), out var disputeGuid);

            var handler = AuthorizationHandlerFactory.Create(role.SystemUserRoleId, Roles.ToList(), disputeGuid);
            var isAuthorized = await handler.IsAuthorized(context, userId);
            if (!isAuthorized)
            {
                throw new NotAuthorizedException();
            }
        }
        catch (NotAuthorizedException)
        {
            context.Result = new UnauthorizedResult();
            context.HttpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
        }
        finally
        {
            await base.OnActionExecutionAsync(context, next);
        }
    }

    private static async Task<(int userId, SystemUserRole role)> GetEffectiveUserAndRole(ActionExecutingContext context)
    {
        var userId = 0;
        var userToken = await GetUserToken(context);
        if (userToken == null)
        {
            throw new NotAuthorizedException();
        }

        var user = userToken.SystemUserId.HasValue ? await GetUser(context, userToken.SystemUserId.GetValueOrDefault()) : null;
        if (user != null)
        {
            userId = user.SystemUserId;
            SetClaims(context, user);
        }

        var role = user != null ? await GetRole(context, user.SystemUserRole.SystemUserRoleId) : null;

        if (userToken.ParticipantId != null)
        {
            userId = userToken.ParticipantId.GetValueOrDefault();
            role = await GetRole(context, (int)Common.Utilities.Roles.AccessCodeUser);
        }

        return (userId, role);
    }

    private static async Task<SystemUserRole> GetRole(ActionExecutingContext context, int roleId)
    {
        var roleService = context.GetService<IRoleService>();
        var role = await roleService.GetRole(roleId);

        return role;
    }

    private static async Task<UserToken> GetUserToken(ActionExecutingContext context)
    {
        var tokenService = context.GetService<ITokenService>();
        var tokenValue = context.HttpContext.Request.GetToken();
        if (tokenService != null && string.IsNullOrWhiteSpace(tokenValue) == false)
        {
            var userToken = await tokenService.GetUserToken(tokenValue);
            if (userToken != null)
            {
                var isValid = await tokenService.ValidateAndRefreshToken(userToken.AuthToken);
                return isValid ? userToken : null;
            }
        }

        return null;
    }

    private static async Task<SystemUser> GetUser(ActionExecutingContext context, int userId)
    {
        var userService = context.GetService<IUserService>();
        var user = await userService.GetUserWithFullInfo(userId);

        return user;
    }

    private static void SetClaims(ActionContext context, SystemUser user)
    {
        var claims = new List<System.Security.Claims.Claim>
        {
            new(ClaimTypes.Name, user.SystemUserId.ToString()),
            new(ClaimTypes.Role, user.SystemUserRole.SystemUserRoleId.ToString())
        };

        var identity = new ClaimsIdentity(claims);

        var principal = new ClaimsPrincipal(identity);

        context.HttpContext.User = principal;
    }
}