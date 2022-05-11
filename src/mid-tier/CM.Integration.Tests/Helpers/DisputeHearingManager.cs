using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class DisputeHearingManager
{
    public static EntityWithStatus<DisputeHearingResponse> CreateDisputeHearing(HttpClient client, DisputeHearingRequest request)
    {
        return client.PostAsync<DisputeHearingResponse>(RouteHelper.PostDisputeHearing, request);
    }

    public static EntityWithStatus<List<DisputeHearingGetResponse>> GetDisputeHearings(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeHearingGetResponse>>(RouteHelper.GetDisputeHearings + disputeGuid);
    }

    public static HttpResponseMessage DeleteDisputeHearing(HttpClient client, int disputeHearingId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteDisputeHearing + disputeHearingId).Result;
        return response;
    }

    public static EntityWithStatus<DisputeHearingResponse> UpdateDisputeHearing(HttpClient client, int disputeHearingId, DisputeHearingPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<DisputeHearingPatchRequest>();
        if (request.DisputeHearingStatus != null)
        {
            patchDoc.Replace(e => e.DisputeHearingStatus, request.DisputeHearingStatus);
        }

        return client.PatchAsync<DisputeHearingResponse>(RouteHelper.PatchDisputeHearing + disputeHearingId, patchDoc);
    }

    public static EntityWithStatus<List<DisputeHearingGetResponse>> GetDisputeHearingsHistory(HttpClient client, DisputeHearingHistoryRequest request)
    {
        return client.SearchAsync<List<DisputeHearingGetResponse>>(RouteHelper.GetDisputeHearingsHistory, request);
    }
}