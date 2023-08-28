using System;
using System.Net.Http;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public static class ParticipantIdentityManager
    {
        public static EntityWithStatus<ParticipantIdentityResponse> CreateParticipantIdentity(HttpClient client, ParticipantIdentityPostRequest request)
        {
            return client.PostAsync<ParticipantIdentityResponse>(RouteHelper.PostParticipantIdentity, request);
        }

        public static EntityWithStatus<ParticipantIdentityResponse> UpdateParticipantIdentity(HttpClient client, int participantIdentityId, ParticipantIdentityPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<ParticipantIdentityPatchRequest>();
            if (request.IdentityStatus != null)
            {
                patchDoc.Replace(e => e.IdentityStatus, request.IdentityStatus);
            }

            return client.PatchAsync<ParticipantIdentityResponse>(RouteHelper.PatchParticipantIdentity + participantIdentityId, patchDoc);
        }

        public static HttpResponseMessage DeleteParticipantIdentity(HttpClient client, int participantIdentityId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteParticipantIdentity + participantIdentityId).Result;
            return response;
        }

        public static EntityWithStatus<ParticipantIdentityResponse> GetParticipantIdentity(HttpClient client, int participantIdentityId)
        {
            return client.GetAsync<ParticipantIdentityResponse>(RouteHelper.GetParticipantIdentity + participantIdentityId);
        }

        public static EntityWithStatus<ParticipantIdentitiesResponse> GetIdentitiesByDispute(HttpClient client, Guid disputeGuid)
        {
            return client.GetAsync<ParticipantIdentitiesResponse>(RouteHelper.GetIdentitiesByDispute + disputeGuid);
        }

        public static EntityWithStatus<ParticipantIdentitiesResponse> GetIdentitiesByParticipant(HttpClient client, int participantId)
        {
            return client.GetAsync<ParticipantIdentitiesResponse>(RouteHelper.GetIdentitiesByParticipant + participantId);
        }
    }
}
