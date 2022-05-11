using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.AuditLog;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class AuditLogManager
{
    public static EntityWithStatus<AuditLogItemResponse> GetAuditLog(HttpClient client, int auditLogId)
    {
        return client.GetAsync<AuditLogItemResponse>(RouteHelper.GetAuditLog + auditLogId);
    }

    public static EntityWithStatus<List<AuditLogItemResponse>> GetAuditLogs(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<AuditLogItemResponse>>(RouteHelper.GetAuditLogs + disputeGuid);
    }
}