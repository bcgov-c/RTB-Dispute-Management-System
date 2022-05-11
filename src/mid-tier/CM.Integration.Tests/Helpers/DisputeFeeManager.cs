using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Payment;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class DisputeFeeManager
{
    public static EntityWithStatus<DisputeFeeResponse> CreateDisputeFee(HttpClient client, Guid disputeGuid, DisputeFeeRequest request)
    {
        return client.PostAsync<DisputeFeeResponse>(RouteHelper.PostDisputeFee + disputeGuid, request);
    }

    public static EntityWithStatus<DisputeFeeResponse> GetDisputeFee(HttpClient client, int disputeFeeId)
    {
        return client.GetAsync<DisputeFeeResponse>(RouteHelper.GetDisputeFee + disputeFeeId);
    }

    public static EntityWithStatus<DisputeFeeResponse> UpdateDisputeFee(HttpClient client, object disputeFeeId, PatchDisputeFeeRequest request)
    {
        var patchDoc = new JsonPatchDocument<PatchDisputeFeeRequest>();
        if (request.AmountDue != null)
        {
            patchDoc.Replace(e => e.AmountDue, request.AmountDue);
        }

        return client.PatchAsync<DisputeFeeResponse>(RouteHelper.PatchDisputeFee + disputeFeeId, patchDoc);
    }

    public static HttpResponseMessage DeleteDisputeFee(HttpClient client, int disputeFeeId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteDisputeFee + disputeFeeId).Result;
        return response;
    }

    public static EntityWithStatus<List<DisputeFeeResponse>> GetDisputeFees(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeFeeResponse>>(RouteHelper.GetDisputeFees + disputeGuid);
    }
}