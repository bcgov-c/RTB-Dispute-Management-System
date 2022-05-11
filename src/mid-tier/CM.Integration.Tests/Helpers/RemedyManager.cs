using System.Net.Http;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class RemedyManager
{
    public static EntityWithStatus<RemedyResponse> CreateRemedy(HttpClient client, int claimId, RemedyRequest request)
    {
        return client.PostAsync<RemedyResponse>(RouteHelper.PostRemedy + claimId, request);
    }

    public static EntityWithStatus<RemedyResponse> UpdateRemedy(HttpClient client, int remedyId, RemedyRequest request)
    {
        var patchDoc = new JsonPatchDocument<RemedyRequest>();
        if (request.RemedyStatus > 0)
        {
            patchDoc.Replace(e => e.RemedyStatus, request.RemedyStatus);
        }

        return client.PatchAsync<RemedyResponse>(RouteHelper.PatchRemedy + remedyId, patchDoc);
    }

    public static HttpResponseMessage DeleteRemedy(HttpClient client, int remedyId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteRemedy + remedyId).Result;
        return response;
    }

    public static EntityWithStatus<RemedyDetailResponse> CreateRemedyDetail(HttpClient client, int remedyId, RemedyDetailRequest request)
    {
        return client.PostAsync<RemedyDetailResponse>(RouteHelper.PostRemedyDetail + remedyId, request);
    }

    public static EntityWithStatus<RemedyDetailResponse> UpdateRemedyDetail(HttpClient client, int remedyDetailId, RemedyDetailRequest request)
    {
        var patchDoc = new JsonPatchDocument<RemedyDetailRequest>();
        if (request.DescriptionBy > 0)
        {
            patchDoc.Replace(e => e.DescriptionBy, request.DescriptionBy);
        }

        return client.PatchAsync<RemedyDetailResponse>(RouteHelper.PatchRemedyDetail + remedyDetailId, patchDoc);
    }

    public static HttpResponseMessage DeleteRemedyDetail(HttpClient client, int remedyDetailId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteRemedyDetail + remedyDetailId).Result;
        return response;
    }
}