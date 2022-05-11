using System.Net.Http;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class HearingAuditLogManager
{
    public static EntityWithStatus<HearingAuditLogGetResponse> GetHearingAuditLogs(HttpClient client, HearingAuditLogGetRequest request)
    {
        return client.SearchAsync<HearingAuditLogGetResponse>(RouteHelper.GetHearingAuditLogs, request);
    }
}