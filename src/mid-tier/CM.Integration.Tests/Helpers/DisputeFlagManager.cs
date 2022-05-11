using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class DisputeFlagManager
{
    public static EntityWithStatus<PostDisputeFlagResponse> CreateDisputeFlag(HttpClient client, Guid disputeGuid, PostDisputeFlagRequest request)
    {
        return client.PostAsync<PostDisputeFlagResponse>(RouteHelper.PostDisputeFlag + disputeGuid, request);
    }

    public static EntityWithStatus<PostDisputeFlagResponse> GetDisputeFlag(HttpClient client, int disputeFlagId)
    {
        return client.GetAsync<PostDisputeFlagResponse>(RouteHelper.GetDisputeFlag + disputeFlagId);
    }

    public static EntityWithStatus<PostDisputeFlagResponse> UpdateDisputeFlag(HttpClient client, object disputeFlagId, PatchDisputeFlagRequest request)
    {
        var patchDoc = new JsonPatchDocument<PatchDisputeFlagRequest>();
        if (request.FlagEndDate != null)
        {
            patchDoc.Replace(e => e.FlagEndDate, request.FlagEndDate);
        }

        if (!string.IsNullOrEmpty(request.FlagTitle))
        {
            patchDoc.Replace(e => e.FlagTitle, request.FlagTitle);
        }

        return client.PatchAsync<PostDisputeFlagResponse>(RouteHelper.PatchDisputeFlag + disputeFlagId, patchDoc);
    }

    public static HttpResponseMessage DeleteDisputeFlag(HttpClient client, int disputeFlagId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteDisputeFlag + disputeFlagId).Result;
        return response;
    }

    public static EntityWithStatus<List<PostDisputeFlagResponse>> GetDisputeFlags(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<PostDisputeFlagResponse>>(RouteHelper.GetDisputeFlags + disputeGuid);
    }

    public static EntityWithStatus<List<PostDisputeFlagResponse>> GetLinkedDisputeFlags(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<PostDisputeFlagResponse>>(RouteHelper.GetLinkedDisputeFlags + disputeGuid);
    }
}