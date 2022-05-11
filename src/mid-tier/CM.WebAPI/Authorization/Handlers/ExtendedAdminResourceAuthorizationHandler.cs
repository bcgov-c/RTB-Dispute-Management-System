using System.Threading.Tasks;
using CM.Business.Services.UserServices;
using CM.WebAPI.Controllers;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public class ExtendedAdminResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        var userService = context.GetService<IUserService>();
        var user = await userService.GetUserWithFullInfo(userId);
        var action = context.ActionDescriptor.RouteValues["action"];
        var isAuthorized = false;

        switch (context.Controller)
        {
            case DisputeHearingController:
            {
                if (action.Equals("Post") || action.Equals("Delete") || action.Equals("Patch") || action.Equals("GetDisputeHearingHistory"))
                {
                    if (user.Scheduler)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case HearingController:
            {
                if (action.Equals("Delete") || action.Equals("GetAvailableStaff") ||
                    action.Equals("GetAvailableConferenceBridges") || action.Equals("Reassign") || action.Equals("Reschedule"))
                {
                    if (user.Scheduler)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case HearingReportingController:
            {
                if (action.Equals("GetYearlyHearingSummary") || action.Equals("GetMonthlyHearingSummary") ||
                    action.Equals("GetDailyHearingDetail") || action.Equals("GetAvailableHearings"))
                {
                    if (user.Scheduler)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case HearingAuditLogController:
            {
                if (action.Equals("GetHearingAuditLogs"))
                {
                    if (user.Scheduler)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case EmailTemplateController:
            {
                if (action.Equals("Post") || action.Equals("Delete") || action.Equals("Patch"))
                {
                    if (user.AdminAccess)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case BulkEmailRecipientController:
            {
                if (action.Equals("Post"))
                {
                    if (user.AdminAccess)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }

            case CustomConfigObjectController:
            {
                if (action.Equals("Post") || action.Equals("Delete") || action.Equals("Patch") ||
                    action.Equals("Get") || action.Equals("GetPublicCustomObjects") ||
                    action.Equals("GetPrivateCustomObjects"))
                {
                    if (user.AdminAccess)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            }
        }

        return isAuthorized;
    }
}