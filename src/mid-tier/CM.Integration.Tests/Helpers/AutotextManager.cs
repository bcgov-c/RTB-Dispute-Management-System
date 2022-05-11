using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.AutoText;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class AutotextManager
{
    public static EntityWithStatus<AutoTextResponse> CreateAutotext(HttpClient client, AutoTextPostRequest request)
    {
        return client.PostAsync<AutoTextResponse>(RouteHelper.PostAutotext, request);
    }

    public static EntityWithStatus<AutoTextResponse> UpdateAutotext(HttpClient client, int autoTextId, AutoTextPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<AutoTextPatchRequest>();
        if (request.TextStatus > 0)
        {
            patchDoc.Replace(e => e.TextStatus, request.TextStatus);
        }

        return client.PatchAsync<AutoTextResponse>(RouteHelper.PatchAutotext + autoTextId, patchDoc);
    }

    public static EntityWithStatus<AutoTextResponse> GetAutotext(HttpClient client, int autoTextId)
    {
        return client.GetAsync<AutoTextResponse>(RouteHelper.GetAutotext + autoTextId);
    }

    public static EntityWithStatus<List<AutoTextResponse>> GetAllAutoTexts(HttpClient client, AutoTextGetRequest request)
    {
        return client.GetAsync<List<AutoTextResponse>>(RouteHelper.GetAllAutotext, request);
    }

    public static HttpResponseMessage DeleteAutotext(HttpClient client, int autoTextId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteAutotext + autoTextId).Result;
        return response;
    }
}