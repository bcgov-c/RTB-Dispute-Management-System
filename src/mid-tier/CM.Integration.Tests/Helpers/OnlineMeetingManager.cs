using System.Net.Http;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public class OnlineMeetingManager
    {
        public static EntityWithStatus<OnlineMeetingResponse> CreateOnlineMeeting(HttpClient client, OnlineMeetingPostRequest request)
        {
            return client.PostAsync<OnlineMeetingResponse>(RouteHelper.PostOnlineMeeting, request);
        }

        public static EntityWithStatus<OnlineMeetingResponse> UpdateOnlineMeeting(HttpClient client, int onlineMeetingId, OnlineMeetingPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<OnlineMeetingPatchRequest>();
            if (request.ConferenceUrl != null)
            {
                patchDoc.Replace(e => e.ConferenceUrl, request.ConferenceUrl);
            }

            return client.PatchAsync<OnlineMeetingResponse>(RouteHelper.PatchOnlineMeeting + onlineMeetingId, patchDoc);
        }

        public static HttpResponseMessage DeleteOnlineMeeting(HttpClient client, int onlineMeetingId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteOnlineMeeting + onlineMeetingId).Result;
            return response;
        }

        public static EntityWithStatus<OnlineMeetingResponse> GetOnlineMeeting(HttpClient client, int onlineMeetingId)
        {
            return client.GetAsync<OnlineMeetingResponse>(RouteHelper.GetOnlineMeeting + onlineMeetingId);
        }
    }
}
