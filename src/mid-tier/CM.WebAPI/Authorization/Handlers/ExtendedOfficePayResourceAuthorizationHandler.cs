using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Services.Files;
using CM.Business.Services.UserServices;
using CM.WebAPI.Controllers;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public class ExtendedOfficePayResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        var action = context.ActionDescriptor.RouteValues["action"];
        var userService = context.GetService<IUserService>();
        var user = await userService.GetUserWithFullInfo(userId);
        var disputeGuid = Guid.Empty;
        var bypassAuth = false;

        switch (context.Controller)
        {
            case FileController:
                if (action.Equals("Delete"))
                {
                    var fileId = context.GetContextId<int>("fileId");
                    var fileService = context.GetService<IFileService>();
                    var file = await fileService.GetNoTrackingFileAsync(fileId);
                    if (file.CreatedBy == userId)
                    {
                        bypassAuth = true;
                    }
                }

                break;
        }

        var isAuthorized = user.DisputeUsers != null && user.DisputeUsers.Any(x => x.DisputeGuid == disputeGuid);
        return isAuthorized || bypassAuth;
    }
}