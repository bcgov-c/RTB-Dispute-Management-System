using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocReqItemManager
{
    public static EntityWithStatus<OutcomeDocRequestItemResponse> CreateOutcomeDocReqItem(HttpClient client, int outcomeDocRequestId, OutcomeDocRequestItemRequest request)
    {
        return client.PostAsync<OutcomeDocRequestItemResponse>(RouteHelper.PostOutcomeDocReqItem + outcomeDocRequestId, request);
    }

    public static EntityWithStatus<OutcomeDocRequestItemResponse> UpdateOutcomeDocReqItem(HttpClient client, int outcomeDocReqItemId, OutcomeDocRequestItemPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocRequestItemPatchRequest>();
        if (request.ItemSubType > 0)
        {
            patchDoc.Replace(e => e.ItemSubType, request.ItemSubType);
        }

        if (string.IsNullOrEmpty(request.ItemDescription))
        {
            patchDoc.Replace(e => e.ItemDescription, request.ItemDescription);
        }

        return client.PatchAsync<OutcomeDocRequestItemResponse>(RouteHelper.PatchOutcomeDocReqItem + outcomeDocReqItemId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocReqItem(HttpClient client, int outcomeDocReqItemId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocReqItem + outcomeDocReqItemId).Result;
        return response;
    }
}