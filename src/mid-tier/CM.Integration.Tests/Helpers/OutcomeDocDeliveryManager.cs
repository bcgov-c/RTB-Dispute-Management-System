using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Entities.Models.OutcomeDocument.Reporting;
using CM.Data.Model;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocDeliveryManager
{
    public static EntityWithStatus<OutcomeDocDeliveryResponse> CreateOutcomeDocDelivery(HttpClient client, int outcomeDocFileId, OutcomeDocDeliveryPostRequest request)
    {
        return client.PostAsync<OutcomeDocDeliveryResponse>(RouteHelper.PostOutcomeDocDelivery + outcomeDocFileId, request);
    }

    public static EntityWithStatus<OutcomeDocDelivery> UpdateOutcomeDocDelivery(HttpClient client, int outcomeDocDeliveryId, OutcomeDocDeliveryPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocDeliveryPatchRequest>();
        if (request.DeliveryPriority > 0)
        {
            patchDoc.Replace(e => e.DeliveryPriority, request.DeliveryPriority);
        }

        return client.PatchAsync<OutcomeDocDelivery>(RouteHelper.PatchOutcomeDocDelivery + outcomeDocDeliveryId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocDelivery(HttpClient client, int outcomeDocDeliveryId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocDelivery + outcomeDocDeliveryId).Result;
        return response;
    }

    public static EntityWithStatus<OutcomeDocDeliveryReportFullResponse> GetUndelivered(HttpClient client)
    {
        return client.GetAsync<OutcomeDocDeliveryReportFullResponse>(RouteHelper.GetUndelivered);
    }
}