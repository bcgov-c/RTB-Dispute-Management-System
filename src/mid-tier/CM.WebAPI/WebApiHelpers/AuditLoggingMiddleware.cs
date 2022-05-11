using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AuditLog;
using CM.Business.Services.AuditLogs;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Business.Services.TokenServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.ServiceBase;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace CM.WebAPI.WebApiHelpers;

public class AuditLoggingMiddleware
{
    private const int IncorrectAssociatedId = -1;

    private readonly RequestDelegate _next;

    public AuditLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var needsAudit = ValidateAudit(context);

        if (needsAudit)
        {
            await _next.Invoke(context);

            var entityId = context.Items["EntityId"] != null ? context.Items["EntityId"].ToString() : string.Empty;
            var auditLogId = await HandleRequest(context, entityId);
            context.Request.Headers.Add("AuditLogID", auditLogId.ToString());
        }
        else
        {
            await _next(context);
        }
    }

    private static async Task<int> HandleRequest(HttpContext context, string entityId)
    {
        var auditLogRequest = await ReadAuditLogFromContext(context);
        var disputeService = context.RequestServices.GetService<IDisputeService>();
        if (disputeService != null)
        {
            if (auditLogRequest.DisputeGuid != Guid.Empty)
            {
                var dispute = await disputeService.GetDisputeNoTrackAsync(auditLogRequest.DisputeGuid);

                if (dispute?.InitialPaymentDate != null)
                {
                    var tokenService = context.RequestServices.GetService<ITokenService>();
                    if (tokenService != null)
                    {
                        var tokenValue = context.Request.GetToken();
                        var userToken = await tokenService.GetUserToken(tokenValue);

                        if (userToken != null)
                        {
                            if (userToken.SystemUserId.HasValue)
                            {
                                var userId = await tokenService.GetUserId(context.Request.GetToken());

                                auditLogRequest.SubmitterUserId = userId;

                                var userService = context.RequestServices.GetService<IUserService>();
                                if (userService != null)
                                {
                                    var user = await userService.GetSystemUser(userId);

                                    if (user.SystemUserRoleId is (int)Roles.StaffUser or (int)Roles.ExternalUser)
                                    {
                                        auditLogRequest.SubmitterRole = user.SystemUserRoleId;
                                        auditLogRequest.SubmitterName = user.Username;
                                    }
                                }
                            }
                            else if (userToken.ParticipantId.HasValue)
                            {
                                var participantService = context.RequestServices.GetService<IParticipantService>();
                                if (participantService != null)
                                {
                                    auditLogRequest.SubmitterParticipantId = userToken.ParticipantId;
                                    auditLogRequest.SubmitterRole = (int)Roles.AccessCodeUser;

                                    var participant =
                                        await participantService.GetAsync(userToken.ParticipantId.Value);

                                    if (participant.ParticipantType == (int)ParticipantType.Business)
                                    {
                                        auditLogRequest.SubmitterName = participant.BusinessName;
                                    }
                                    else
                                    {
                                        auditLogRequest.SubmitterName =
                                            participant.FirstName + " " + participant.LastName;
                                    }
                                }
                            }

                            var auditLogService = context.RequestServices.GetService<IAuditLogService>();
                            if (auditLogService != null)
                            {
                                auditLogRequest.AssociatedRecordId = entityId != string.Empty ? int.Parse(entityId) : IncorrectAssociatedId;
                                var result = await auditLogService.InsertAsync(auditLogRequest);

                                if (result != null)
                                {
                                    return result.AuditLogId;
                                }
                            }
                        }
                    }
                }
            }
        }

        return 0;
    }

    private static bool IsSuccessStatusCode(int? statusCode)
    {
        return statusCode is >= 200 and <= 299;
    }

    private static async Task<AuditLogRequest> ReadAuditLogFromContext(HttpContext context)
    {
        var disputeGuidString = context.Request.Headers[ApiHeader.DisputeGuidToken];
        Guid.TryParse(disputeGuidString.ToString(), out var disputeGuid);

        var requestBody = await context.GetRequestBodyAsync();

        var callData =
            IsSuccessStatusCode(context.Response.StatusCode) && context.Request.Method is "POST" or "DELETE"
                ? string.Empty
                : requestBody;

        return new AuditLogRequest
        {
            ApiName = context.Request.Path,
            ApiCallType = context.Request.Method,
            ApiCallData = callData,
            ChangeDate = DateTime.UtcNow,
            ApiErrorResponse = IsSuccessStatusCode(context.Response.StatusCode) ? string.Empty : requestBody,
            ApiResponse = context.Response.StatusCode.ToString(),
            DisputeGuid = disputeGuid
        };
    }

    private static bool ValidateAudit(HttpContext context)
    {
        if (context.Request.Method == "GET" ||
            context.Request.Path == "/api/hearing/reassign" ||
            context.Request.Path == "/api/hearing/reschedule" ||
            context.Request.Path.StartsWithSegments("/api/customconfigobject"))
        {
            return false;
        }

        return true;
    }
}