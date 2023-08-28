using System;
using System.Net.Http;
using CM.Business.Entities.Models.Poll;
using CM.Business.Entities.Models.PollResponse;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public static class PollManager
    {
        public static EntityWithStatus<PollResponse> CreatePoll(HttpClient client, PollRequest request)
        {
            return client.PostAsync<PollResponse>(RouteHelper.PostPoll, request);
        }

        public static EntityWithStatus<PollResponse> UpdatePoll(HttpClient client, object pollId, PollPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<PollPatchRequest>();
            if (request.PollDescription != null)
            {
                patchDoc.Replace(e => e.PollDescription, request.PollDescription);
            }

            return client.PatchAsync<PollResponse>(RouteHelper.PatchPoll + pollId, patchDoc);
        }

        public static HttpResponseMessage DeletePoll(HttpClient client, int pollId)
        {
            var response = client.DeleteAsync(RouteHelper.DeletePoll + pollId).Result;
            return response;
        }

        public static EntityWithStatus<PollResponse> GetPoll(HttpClient client, int pollId)
        {
            return client.GetAsync<PollResponse>(RouteHelper.GetPoll + pollId);
        }

        public static EntityWithStatus<PollGetResponse> GetPolls(HttpClient client, PollGetRequest request)
        {
            return client.GetAsync<PollGetResponse>(RouteHelper.GetPolls, request);
        }

        // Poll Responses
        public static EntityWithStatus<PollRespResponse> CreatePollResp(HttpClient client, int pollId, PollRespRequest request)
        {
            return client.PostAsync<PollRespResponse>(RouteHelper.PostPollResp + pollId, request);
        }

        public static EntityWithStatus<PollRespResponse> UpdatePollResp(HttpClient client, object pollResponseId, PollRespPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<PollRespPatchRequest>();
            if (request.ResponseText != null)
            {
                patchDoc.Replace(e => e.ResponseText, request.ResponseText);
            }

            return client.PatchAsync<PollRespResponse>(RouteHelper.PatchPollResp + pollResponseId, patchDoc);
        }

        public static HttpResponseMessage DeletePollResp(HttpClient client, int pollResponseId)
        {
            var response = client.DeleteAsync(RouteHelper.DeletePollResp + pollResponseId).Result;
            return response;
        }

        public static EntityWithStatus<PollRespResponse> GetPollResp(HttpClient client, int pollResponseId)
        {
            return client.GetAsync<PollRespResponse>(RouteHelper.GetPollResp + pollResponseId);
        }

        public static EntityWithStatus<PollRespGetResponse> GetParticipantPollResponses(HttpClient client, int participantId)
        {
            return client.GetAsync<PollRespGetResponse>(RouteHelper.GetParticipantPollResponses + participantId);
        }

        public static EntityWithStatus<PollRespGetResponse> GetDisputePollResponses(HttpClient client, Guid disputeGuid)
        {
            return client.GetAsync<PollRespGetResponse>(RouteHelper.GetDisputePollResponses + disputeGuid);
        }
    }
}
