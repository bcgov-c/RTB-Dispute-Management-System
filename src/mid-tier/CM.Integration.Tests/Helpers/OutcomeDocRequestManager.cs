using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocRequestManager
{
    public static EntityWithStatus<OutcomeDocRequestResponse> CreateOutcomeDocRequest(HttpClient client, Guid disputeGuid, OutcomeDocRequestRequest request)
    {
        return client.PostAsync<OutcomeDocRequestResponse>(RouteHelper.PostOutcomeDocRequest + disputeGuid, request);
    }

    public static EntityWithStatus<OutcomeDocRequestResponse> UpdateOutcomeDocRequest(HttpClient client, int outcomeDocRequestId, OutcomeDocRequestPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocRequestPatchRequest>();
        if (request.AffectedDocuments > 0)
        {
            patchDoc.Replace(e => e.AffectedDocuments, request.AffectedDocuments);
        }

        return client.PatchAsync<OutcomeDocRequestResponse>(RouteHelper.PatchOutcomeDocRequest + outcomeDocRequestId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocRequest(HttpClient client, int outcomeDocRequestId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocRequest + outcomeDocRequestId).Result;
        return response;
    }

    public static EntityWithStatus<OutcomeDocRequestGetResponse> GetOutcomeDocRequest(HttpClient client, int outcomeDocRequestId)
    {
        return client.GetAsync<OutcomeDocRequestGetResponse>(RouteHelper.GetOutcomeDocRequest + outcomeDocRequestId);
    }

    public static EntityWithStatus<List<OutcomeDocRequestGetResponse>> GetDisputeOutcomeDocRequests(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<OutcomeDocRequestGetResponse>>(RouteHelper.GetDisputeOutcomeDocRequests + disputeGuid);
    }

    public static EntityWithStatus<List<ExternalOutcomeDocRequestGetResponse>> GetExternalDisputeOutcomeDocRequests(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<ExternalOutcomeDocRequestGetResponse>>(RouteHelper.GetExternalDisputeOutcomeDocRequests + disputeGuid);
    }
}