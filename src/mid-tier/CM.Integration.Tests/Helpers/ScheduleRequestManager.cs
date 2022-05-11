using System.Net.Http;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ScheduleRequestManager
{
    public static EntityWithStatus<ScheduleRequestPostResponse> CreateScheduleRequest(HttpClient client, ScheduleRequestPostRequest request)
    {
        return client.PostAsync<ScheduleRequestPostResponse>(RouteHelper.PostScheduleRequest, request);
    }

    public static EntityWithStatus<ScheduleRequestPatchResponse> UpdateScheduleRequest(HttpClient client, int scheduleRequestId, ScheduleRequestPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ScheduleRequestPatchResponse>();
        if (request.RequestNote != null)
        {
            patchDoc.Replace(e => e.RequestNote, request.RequestNote);
        }

        return client.PatchAsync<ScheduleRequestPatchResponse>(RouteHelper.PatchScheduleRequest + scheduleRequestId, patchDoc);
    }

    public static HttpResponseMessage DeleteRequest(HttpClient client, int scheduleRequestId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteScheduleRequest + scheduleRequestId).Result;
        return response;
    }

    public static EntityWithStatus<ScheduleRequestGetResponse> GetScheduleRequest(HttpClient client, int scheduleRequestId)
    {
        return client.GetAsync<ScheduleRequestGetResponse>(RouteHelper.GetScheduleRequest + scheduleRequestId);
    }

    public static EntityWithStatus<ScheduleRequestFullResponse> GetScheduleRequests(HttpClient client, ScheduleRequestsGetRequest request)
    {
        return client.GetAsync<ScheduleRequestFullResponse>(RouteHelper.GetScheduleRequests);
    }
}