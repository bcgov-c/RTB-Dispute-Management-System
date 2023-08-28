using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public class DisputeLinkManager
    {
        public static EntityWithStatus<DisputeLinkResponse> CreateDisputeLink(HttpClient client, DisputeLinkPostRequest request)
        {
            return client.PostAsync<DisputeLinkResponse>(RouteHelper.PostDisputeLink, request);
        }

        public static EntityWithStatus<DisputeLinkResponse> UpdateDisputeLink(HttpClient client, int disputeLinkId, DisputeLinkPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<DisputeLinkPatchRequest>();
            if (request.DisputeLinkStatus != Common.Utilities.DisputeLinkStatus.Active)
            {
                patchDoc.Replace(e => e.DisputeLinkStatus, request.DisputeLinkStatus);
            }

            return client.PatchAsync<DisputeLinkResponse>(RouteHelper.PatchDisputeLink + disputeLinkId, patchDoc);
        }

        public static HttpResponseMessage DeleteDisputeLink(HttpClient client, int disputeLinkId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteDisputeLink + disputeLinkId).Result;
            return response;
        }

        public static EntityWithStatus<List<DisputeLinkResponse>> GetDisputeLink(HttpClient client, Guid disputeGuid)
        {
            return client.GetAsync<List<DisputeLinkResponse>>(RouteHelper.GetDisputeLink + disputeGuid);
        }
    }
}
