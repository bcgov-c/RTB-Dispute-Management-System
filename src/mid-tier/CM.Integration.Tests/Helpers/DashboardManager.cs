using System.Net.Http;
using CM.Business.Entities.Models.Dashboard;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class DashboardManager
{
    public static EntityWithStatus<DashboardSearchResponse> GetAssignedHearings(HttpClient client, int userId, AssignedHearingsRequest request)
    {
        return client.GetAsync<DashboardSearchResponse>(RouteHelper.AssignedHearings + userId, request);
    }

    public static EntityWithStatus<DashboardSearchResponse> GetUnAssignedHearings(HttpClient client, UnAssignedHearingsRequest request)
    {
        return client.GetAsync<DashboardSearchResponse>(RouteHelper.UnAssignedHearings, request);
    }

    public static EntityWithStatus<DashboardSearchResponse> GetAssignedDisputes(HttpClient client, int userId, DashboardSearchDisputesRequest request)
    {
        return client.GetAsync<DashboardSearchResponse>(RouteHelper.AssignedDisputes + userId, request);
    }

    public static EntityWithStatus<DashboardSearchResponse> GetUnAssignedDisputes(HttpClient client, DashboardSearchDisputesRequest request)
    {
        return client.GetAsync<DashboardSearchResponse>(RouteHelper.UnAssignedDisputes, request);
    }
}