using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ConferenceBridgeManager
{
    public static EntityWithStatus<ConferenceBridgeResponse> CreateConferenceBridge(HttpClient client, ConferenceBridgeRequest request)
    {
        return client.PostAsync<ConferenceBridgeResponse>(RouteHelper.PostConferenceBridge, request);
    }

    public static EntityWithStatus<ConferenceBridgeResponse> PatchConferenceBridge(HttpClient client, int bridgeId, ConferenceBridgeRequest request)
    {
        var patchDoc = new JsonPatchDocument<ConferenceBridgeRequest>();
        if (request.BridgeStatus != null)
        {
            patchDoc.Replace(e => e.BridgeStatus, request.BridgeStatus);
        }

        return client.PatchAsync<ConferenceBridgeResponse>(RouteHelper.PatchConferenceBridge + bridgeId, patchDoc);
    }

    public static EntityWithStatus<ConferenceBridgeResponse> GetConferenceBridge(HttpClient client, int conferenceBridgeId)
    {
        return client.GetAsync<ConferenceBridgeResponse>(RouteHelper.GetConferenceBridge + conferenceBridgeId);
    }

    public static EntityWithStatus<List<ConferenceBridgeResponse>> GetConferenceBridges(HttpClient client)
    {
        return client.GetAsync<List<ConferenceBridgeResponse>>(RouteHelper.GetConferenceBridges);
    }
}