using System;
using System.Net.Http;
using CM.Business.Entities.Models.WorkflowReport;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class WorkflowReportsManager
{
    public static EntityWithStatus<WorkflowReportResponse> GetWorkflowReports(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<WorkflowReportResponse>(RouteHelper.GetWorkflowReports + disputeGuid);
    }
}