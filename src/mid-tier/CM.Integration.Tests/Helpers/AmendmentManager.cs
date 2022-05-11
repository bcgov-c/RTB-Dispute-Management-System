using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Amendment;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class AmendmentManager
{
    public static EntityWithStatus<AmendmentResponse> CreateAmendment(HttpClient client, Guid disputeGuid, AmendmentRequest request)
    {
        return client.PostAsync<AmendmentResponse>(RouteHelper.PostAmendment + disputeGuid, request);
    }

    public static EntityWithStatus<AmendmentResponse> UpdateAmendment(HttpClient client, int amendmentId, AmendmentRequest request)
    {
        var patchDoc = new JsonPatchDocument<AmendmentRequest>();
        if (request.AmendmentDescription != null)
        {
            patchDoc.Replace(e => e.AmendmentDescription, request.AmendmentDescription);
        }

        return client.PatchAsync<AmendmentResponse>(RouteHelper.PatchAmendment + amendmentId, patchDoc);
    }

    public static EntityWithStatus<AmendmentResponse> GetAmendment(HttpClient client, int amendmentId)
    {
        return client.GetAsync<AmendmentResponse>(RouteHelper.GetAmendment + amendmentId);
    }

    public static EntityWithStatus<List<AmendmentResponse>> GetDisputeAmendments(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<AmendmentResponse>>(RouteHelper.GetDisputeAmendments + disputeGuid);
    }
}