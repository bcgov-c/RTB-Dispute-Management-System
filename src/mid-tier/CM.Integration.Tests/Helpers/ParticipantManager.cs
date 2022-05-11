using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Parties;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ParticipantManager
{
    public static EntityWithStatus<List<ParticipantResponse>> CreateParticipant(HttpClient client, Guid disputeGuid, List<ParticipantRequest> requestList)
    {
        return client.PostAsync<List<ParticipantResponse>>(RouteHelper.PostParticipant + disputeGuid, requestList);
    }

    public static HttpResponseMessage DeleteParticipant(HttpClient client, int participantId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteParticipant + participantId).Result;
        return response;
    }

    public static EntityWithStatus<ParticipantResponse> PatchParticipant(HttpClient client, int participantId, ParticipantRequest request)
    {
        var patchDoc = new JsonPatchDocument<ParticipantRequest>();
        if (request.Address != null)
        {
            patchDoc.Replace(e => e.Address, request.Address);
        }

        if (request.BusinessContactFirstName != null)
        {
            patchDoc.Replace(e => e.BusinessContactFirstName, request.BusinessContactFirstName);
        }

        return client.PatchAsync<ParticipantResponse>(RouteHelper.PatchParticipant + participantId, patchDoc);
    }

    public static EntityWithStatus<ParticipantResponse> GetParticipant(HttpClient client, int participantId)
    {
        return client.GetAsync<ParticipantResponse>(RouteHelper.GetParticipant + participantId);
    }

    public static EntityWithStatus<List<ParticipantResponse>> GetDisputeParticipants(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<ParticipantResponse>>(RouteHelper.GetDisputeParticipants + disputeGuid);
    }
}