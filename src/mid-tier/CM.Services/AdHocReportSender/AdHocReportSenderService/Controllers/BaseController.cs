using System;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Controllers
{
    public class BaseController : ControllerBase
    {
        protected bool CheckModified(IAdHocServiceBase service, object id)
        {
            if (Request.Headers.ContainsKey(ApiHeader.IfUnmodifiedSince))
            {
                var ifUnmodifiedSince = DateTime.Parse(Request.Headers[ApiHeader.IfUnmodifiedSince]);
                var lastModified = service.GetLastModifiedDateAsync(id).Result;

                if (lastModified?.Ticks > ifUnmodifiedSince.Ticks)
                {
                    return true;
                }
            }

            return false;
        }

        protected int GetLoggedInUserId()
        {
            var username = User.Identity?.Name;

            return int.Parse(username ?? "0");
        }

        protected ObjectResult StatusConflicted(string apiReturnMessage = ApiReturnMessages.ConflictOccured)
        {
            return StatusCode(StatusCodes.Status409Conflict, apiReturnMessage);
        }
    }
}
