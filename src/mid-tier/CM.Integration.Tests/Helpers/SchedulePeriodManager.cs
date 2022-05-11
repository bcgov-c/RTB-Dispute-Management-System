using System.Net.Http;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class SchedulePeriodManager
{
    public static EntityWithStatus<SchedulePeriodPostResponse> CreateSchedulePeriod(HttpClient client, SchedulePeriodPostRequest request)
    {
        return client.PostAsync<SchedulePeriodPostResponse>(RouteHelper.PostSchedulePeriod, request);
    }

    public static EntityWithStatus<SchedulePeriodPostResponse> UpdateSchedulePeriod(HttpClient client, int schedulePeriodId, SchedulePeriodPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<SchedulePeriodPatchRequest>();
        if (request.PeriodStatus >= Common.Utilities.PeriodStatus.OpenForEditing)
        {
            patchDoc.Replace(e => e.PeriodStatus, request.PeriodStatus);
        }

        return client.PatchAsync<SchedulePeriodPostResponse>(RouteHelper.PatchSchedulePeriod + schedulePeriodId, patchDoc);
    }

    public static EntityWithStatus<SchedulePeriodPostResponse> GetSchedulePeriod(HttpClient client, int schedulePeriodId)
    {
        return client.GetAsync<SchedulePeriodPostResponse>(RouteHelper.GetSchedulePeriod + schedulePeriodId);
    }

    public static EntityWithStatus<SchedulePeriodGetFilterResponse> GetSchedulePeriodByFilter(HttpClient client, SchedulePeriodGetRequest request)
    {
        return client.GetAsync<SchedulePeriodGetFilterResponse>(RouteHelper.GetSchedulePeriod, request);
    }
}