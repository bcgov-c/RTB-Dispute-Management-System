using System.Net.Http;
using CM.Business.Entities.Models.Hearing;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class HearingParticipationManager
{
    public static EntityWithStatus<HearingParticipationResponse> CreateHearingParticipation(HttpClient client, int hearingId, HearingParticipationRequest request)
    {
        return client.PostAsync<HearingParticipationResponse>(RouteHelper.PostHearingParticipant + hearingId, request);
    }

    public static EntityWithStatus<HearingParticipationResponse> PatchHearingParticipation(HttpClient client, int hearingParticipationId, HearingParticipationRequest request)
    {
        var patchDoc = new JsonPatchDocument<HearingParticipationRequest>();
        if (request.OtherParticipantName != null)
        {
            patchDoc.Replace(e => e.OtherParticipantName, request.OtherParticipantName);
        }

        return client.PatchAsync<HearingParticipationResponse>(RouteHelper.PatchHearingParticipation + hearingParticipationId, patchDoc);
    }

    public static HttpResponseMessage DeleteHearingParticipation(HttpClient client, int hearingParticipationId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteHearingParticipant + hearingParticipationId).Result;
        return response;
    }
}