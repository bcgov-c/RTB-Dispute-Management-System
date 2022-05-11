using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class CustomObjectManager
{
    public static EntityWithStatus<CustomDataObjectResponse> CreateCustomDataObject(HttpClient client, Guid disputeGuid, CustomDataObjectRequest request)
    {
        return client.PostAsync<CustomDataObjectResponse>(RouteHelper.PostCustomObject + disputeGuid, request);
    }

    public static EntityWithStatus<CustomDataObjectResponse> UpdateCustomDataObject(HttpClient client, int customObjectId, CustomObjectPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<CustomObjectPatchRequest>();
        if (request.Description != null)
        {
            patchDoc.Replace(e => e.Description, request.Description);
        }

        if (request.IsAmended != null)
        {
            patchDoc.Replace(e => e.IsAmended, request.IsAmended);
        }

        return client.PatchAsync<CustomDataObjectResponse>(RouteHelper.PatchCustomObject + customObjectId, patchDoc);
    }

    public static HttpResponseMessage DeleteCustomDataObject(HttpClient client, int customObjectId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteCustomObject + customObjectId).Result;
        return response;
    }

    public static EntityWithStatus<List<CustomDataObjectResponse>> GetDisputeCustomObjects(HttpClient client, Guid disputeGuid, CustomObjectGetRequest request)
    {
        return client.SearchAsync<List<CustomDataObjectResponse>>(RouteHelper.GetDisputeCustomObjects + disputeGuid + "?", request);
    }

    public static EntityWithStatus<CustomDataObjectResponse> GetCustomDataObject(HttpClient client, int customObjectId)
    {
        return client.GetAsync<CustomDataObjectResponse>(RouteHelper.GetCustomObject + customObjectId);
    }
}