using System.Net.Http;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public static class ExternalErrorLogManager
    {
        public static EntityWithStatus<ExternalErrorLogResponse> CreateExternalErrorLog(HttpClient client, ExternalErrorLogRequest request)
        {
            return client.PostAsync<ExternalErrorLogResponse>(RouteHelper.PostExternalErrorLog, request);
        }

        public static EntityWithStatus<ExternalErrorLogResponse> CreateExternalErrorLogBySession(HttpClient client, string sessionGuid, ExternalErrorLogRequest request)
        {
            return client.PostAsync<ExternalErrorLogResponse>(RouteHelper.SessionPostExternalErrorLog + sessionGuid, request);
        }

        public static EntityWithStatus<ExternalErrorLogResponse> UpdateExternalErrorLog(HttpClient client, int externalErrorLogId, ExternalErrorLogPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<ExternalErrorLogPatchRequest>();
            if (request.ErrorUrgency.HasValue)
            {
                patchDoc.Replace(e => e.ErrorUrgency, request.ErrorUrgency);
            }

            return client.PatchAsync<ExternalErrorLogResponse>(RouteHelper.PatchExternalErrorLog + externalErrorLogId, patchDoc);
        }

        public static HttpResponseMessage DeleteExternalErrorLog(HttpClient client, int externalErrorLogId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteExternalErrorLog + externalErrorLogId).Result;
            return response;
        }

        public static EntityWithStatus<ExternalErrorLogResponse> GetExternalErrorLog(HttpClient client, int externalErrorLogId)
        {
            return client.GetAsync<ExternalErrorLogResponse>(RouteHelper.GetExternalErrorLog + externalErrorLogId);
        }

        public static EntityWithStatus<ExternalErrorLogGetResponse> GetExternalErrorLogs(HttpClient client, ExternalErrorLogGetRequest request)
        {
            return client.GetAsync<ExternalErrorLogGetResponse>(RouteHelper.GetExternalErrorLogs, request);
        }
    }
}
