using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class DisputeProcessDetailManager
{
    public static EntityWithStatus<DisputeProcessDetailResponse> CreateDisputeProcessDetail(HttpClient client, Guid disputeGuid, DisputeProcessDetailPostRequest request)
    {
        return client.PostAsync<DisputeProcessDetailResponse>(RouteHelper.PostDisputeProcessDetail + disputeGuid, request);
    }

    public static EntityWithStatus<DisputeProcessDetailResponse> UpdateDisputeProcessDetail(HttpClient client, int disputeProcessDetailId, DisputeProcessDetailPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<DisputeProcessDetailPatchRequest>();
        if (request.ProcessMethod > 0)
        {
            patchDoc.Replace(e => e.ProcessMethod, request.ProcessMethod);
        }

        return client.PatchAsync<DisputeProcessDetailResponse>(RouteHelper.PatchDisputeProcessDetail + disputeProcessDetailId, patchDoc);
    }

    public static HttpResponseMessage DeleteDisputeProcessDetail(HttpClient client, int disputeProcessDetailId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteDisputeProcessDetail + disputeProcessDetailId).Result;
        return response;
    }

    public static EntityWithStatus<DisputeProcessDetailResponse> GetDisputeProcessDetail(HttpClient client, int disputeProcessDetailId)
    {
        return client.GetAsync<DisputeProcessDetailResponse>(RouteHelper.GetDisputeProcessDetail + disputeProcessDetailId);
    }

    public static EntityWithStatus<List<DisputeProcessDetailResponse>> GetDisputeDisputeProcessDetails(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeProcessDetailResponse>>(RouteHelper.GetAllDisputeProcessDetails + disputeGuid);
    }
}