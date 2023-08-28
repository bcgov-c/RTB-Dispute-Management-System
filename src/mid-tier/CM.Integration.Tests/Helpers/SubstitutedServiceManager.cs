using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class SubstitutedServiceManager
{
    public static EntityWithStatus<SubstitutedServicePostResponse> CreateSubstitutedService(HttpClient client, Guid disputeGuid, SubstitutedServicePostRequest request)
    {
        return client.PostAsync<SubstitutedServicePostResponse>(RouteHelper.PostSubstitutedService + disputeGuid, request);
    }

    public static EntityWithStatus<SubstitutedServicePostResponse> UpdateSubstitutedService(HttpClient client, int substitutedServiceId, SubstitutedServicePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<SubstitutedServicePostRequest>();
        if (request.FailedMethod1Type > 0)
        {
            patchDoc.Replace(e => e.FailedMethod1Type, request.FailedMethod1Type);
        }

        return client.PatchAsync<SubstitutedServicePostResponse>(RouteHelper.PatchSubstitutedService + substitutedServiceId, patchDoc);
    }

    public static HttpResponseMessage DeleteSubstitutedService(HttpClient client, int substitutedServiceId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteSubstitutedService + substitutedServiceId).Result;
        return response;
    }

    public static EntityWithStatus<SubstitutedServicePostResponse> GetSubstitutedService(HttpClient client, int substitutedServiceId)
    {
        return client.GetAsync<SubstitutedServicePostResponse>(RouteHelper.GetSubstitutedService + substitutedServiceId);
    }

    public static EntityWithStatus<List<SubstitutedServicePostResponse>> GetSubstitutedServices(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<SubstitutedServicePostResponse>>(RouteHelper.GetSubstitutedServices + disputeGuid);
    }

    public static EntityWithStatus<List<ExternalSubstitutedServiceResponse>> GetExternalSubstitutedServices(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<ExternalSubstitutedServiceResponse>>(RouteHelper.GetExternalSubstitutedServices + disputeGuid);
    }
}