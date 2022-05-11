using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Entities.Models.Parties;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ClaimManager
{
    public static EntityWithStatus<ClaimGroupResponse> CreateClaimGroup(HttpClient client, Guid disputeGuid)
    {
        return client.PostAsync<ClaimGroupResponse>(RouteHelper.PostClaimGroup + disputeGuid, null);
    }

    public static EntityWithStatus<List<ClaimGroupParticipantResponse>> CreateClaimGroupParticipant(HttpClient client, int claimGroupId, List<ClaimGroupParticipantRequest> request)
    {
        return client.PostAsync<List<ClaimGroupParticipantResponse>>(RouteHelper.PostClaimGroupParticipant + claimGroupId, request);
    }

    public static EntityWithStatus<ClaimGroupParticipantResponse> UpdateClaimGroupParticipant(HttpClient client, int claimGroupParticipantId, ClaimGroupParticipantRequest request)
    {
        var patchDoc = new JsonPatchDocument<ClaimGroupParticipantRequest>();
        if (request.GroupParticipantRole > 0)
        {
            patchDoc.Replace(e => e.GroupParticipantRole, request.GroupParticipantRole);
        }

        return client.PatchAsync<ClaimGroupParticipantResponse>(RouteHelper.PatchClaimGroupParticipant + claimGroupParticipantId, patchDoc);
    }

    public static HttpResponseMessage DeleteClaimGroupParticipant(HttpClient client, int claimGroupParticipantId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteClaimGroupParticipant + claimGroupParticipantId).Result;
        return response;
    }

    public static EntityWithStatus<List<ClaimGroupParticipantResponse>> GetDisputeClaimGroupParticipants(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<ClaimGroupParticipantResponse>>(RouteHelper.GetDisputeClaimGroupParticipants + disputeGuid);
    }

    public static EntityWithStatus<ClaimResponse> CreateClaim(HttpClient client, int claimGroupId, ClaimRequest request)
    {
        return client.PostAsync<ClaimResponse>(RouteHelper.PostClaim + claimGroupId, request);
    }

    public static EntityWithStatus<ClaimResponse> UpdateClaim(HttpClient client, int claimId, ClaimRequest request)
    {
        var patchDoc = new JsonPatchDocument<ClaimRequest>();
        if (request.ClaimType > 0)
        {
            patchDoc.Replace(e => e.ClaimType, request.ClaimType);
        }

        return client.PatchAsync<ClaimResponse>(RouteHelper.PatchClaim + claimId, patchDoc);
    }

    public static HttpResponseMessage DeleteClaim(HttpClient client, int claimId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteClaim + claimId).Result;
        return response;
    }

    public static EntityWithStatus<ClaimResponse> GetClaim(HttpClient client, int claimId)
    {
        return client.GetAsync<ClaimResponse>(RouteHelper.GetClaim + claimId);
    }

    public static EntityWithStatus<List<ClaimResponse>> GetDisputeClaims(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<ClaimResponse>>(RouteHelper.GetDisputeClaims + disputeGuid);
    }

    public static EntityWithStatus<ClaimDetailResponse> CreateClaimDetail(HttpClient client, int claimId, ClaimDetailRequest request)
    {
        return client.PostAsync<ClaimDetailResponse>(RouteHelper.PostClaimDetail + claimId, request);
    }

    public static HttpResponseMessage DeleteClaimDetail(HttpClient client, int claimDetailId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteClaimDetail + claimDetailId).Result;
        return response;
    }

    public static EntityWithStatus<ClaimDetailResponse> UpdateClaimDetail(HttpClient client, int claimDetailId, ClaimDetailRequest request)
    {
        var patchDoc = new JsonPatchDocument<ClaimDetailRequest>();
        if (request.NoticeMethod > 0)
        {
            patchDoc.Replace(e => e.NoticeMethod, request.NoticeMethod);
        }

        return client.PatchAsync<ClaimDetailResponse>(RouteHelper.PatchClaimDetail + claimDetailId, patchDoc);
    }
}