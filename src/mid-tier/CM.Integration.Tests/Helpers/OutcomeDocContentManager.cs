using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocContentManager
{
    public static EntityWithStatus<OutcomeDocContentResponse> CreateOutcomeDocContent(HttpClient client, int outcomeDocFileId, OutcomeDocContentPostRequest request)
    {
        return client.PostAsync<OutcomeDocContentResponse>(RouteHelper.PostOutcomeDocContent + outcomeDocFileId, request);
    }

    public static EntityWithStatus<OutcomeDocContentResponse> UpdateOutcomeDocContent(HttpClient client, int outcomeDocContentId, OutcomeDocContentPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocContentPatchRequest>();
        if (request.ContentStatus > 0)
        {
            patchDoc.Replace(e => e.ContentStatus, request.ContentStatus);
        }

        return client.PatchAsync<OutcomeDocContentResponse>(RouteHelper.PatchOutcomeDocContent + outcomeDocContentId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocContent(HttpClient client, int outcomeDocContentId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocContent + outcomeDocContentId).Result;
        return response;
    }
}