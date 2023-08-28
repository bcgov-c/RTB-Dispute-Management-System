using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocGroupManager
{
    public static EntityWithStatus<OutcomeDocGroupResponse> CreateOutcomeDocGroup(HttpClient client, Guid disputeGuid, OutcomeDocGroupRequest request)
    {
        return client.PostAsync<OutcomeDocGroupResponse>(RouteHelper.PostOutcomeDocGroup + disputeGuid, request);
    }

    public static EntityWithStatus<OutcomeDocGroupResponse> UpdateOutcomeDocGroup(HttpClient client, int outcomeDocGroupId, OutcomeDocGroupPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocGroupPatchRequest>();
        if (request.DocStatus > 0)
        {
            patchDoc.Replace(e => e.DocStatus, request.DocStatus);
        }

        return client.PatchAsync<OutcomeDocGroupResponse>(RouteHelper.PatchOutcomeDocGroup + outcomeDocGroupId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocGroup(HttpClient client, int outcomeDocGroupId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocGroup + outcomeDocGroupId).Result;
        return response;
    }

    public static EntityWithStatus<OutcomeDocGroupFullResponse> GetOutcomeDocGroup(HttpClient client, int outcomeDocGroupId)
    {
        return client.GetAsync<OutcomeDocGroupFullResponse>(RouteHelper.GetOutcomeDocGroup + outcomeDocGroupId);
    }

    public static EntityWithStatus<List<OutcomeDocGroupFullResponse>> GetDisputeOutcomeDocGroups(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<OutcomeDocGroupFullResponse>>(RouteHelper.GetDisputeOutcomeDocGroups + disputeGuid);
    }

    public static EntityWithStatus<List<ExternalOutcomeDocGroupResponse>> GetExternalOutcomeDocGroups(HttpClient client, Guid disputeGuid, ExternalOutcomeDocGroupRequest request)
    {
        return client.GetAsync<List<ExternalOutcomeDocGroupResponse>>(RouteHelper.GetExternalOutcomeDocGroups + disputeGuid, request);
    }
}