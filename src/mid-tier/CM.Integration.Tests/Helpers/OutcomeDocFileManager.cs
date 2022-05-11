using System.Net.Http;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class OutcomeDocFileManager
{
    public static EntityWithStatus<OutcomeDocFileResponse> CreateOutcomeDocFile(HttpClient client, int outcomeDocGroupId, OutcomeDocFilePostRequest request)
    {
        return client.PostAsync<OutcomeDocFileResponse>(RouteHelper.PostOutcomeDocFile + outcomeDocGroupId, request);
    }

    public static EntityWithStatus<OutcomeDocContentResponse> UpdateOutcomeDocFile(HttpClient client, int outcomeDocFileId, OutcomeDocFilePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<OutcomeDocFilePatchRequest>();
        if (request.FileStatus > 0)
        {
            patchDoc.Replace(e => e.FileStatus, request.FileStatus);
        }

        if (request.VisibleToPublic.HasValue)
        {
            patchDoc.Replace(e => e.VisibleToPublic, request.VisibleToPublic);
        }

        return client.PatchAsync<OutcomeDocContentResponse>(RouteHelper.PatchOutcomeDocFile + outcomeDocFileId, patchDoc);
    }

    public static HttpResponseMessage DeleteOutcomeDocFile(HttpClient client, int outcomeDocGroupId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteOutcomeDocFile + outcomeDocGroupId).Result;
        return response;
    }
}