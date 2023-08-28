using System.Net.Http;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public static class CustomConfigObjectManager
    {
        public static EntityWithStatus<CustomConfigObjectResponse> CreateCustomConfigObject(HttpClient client, CustomConfigObjectPostRequest request)
        {
            return client.PostAsync<CustomConfigObjectResponse>(RouteHelper.PostCustomConfigObject, request);
        }

        public static EntityWithStatus<CustomConfigObjectResponse> UpdateCustomConfigObject(HttpClient client, int customConfigObjectId, CustomConfigObjectPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<CustomConfigObjectPatchRequest>();
            if (request.ObjectTitle != null)
            {
                patchDoc.Replace(e => e.ObjectTitle, request.ObjectTitle);
            }

            return client.PatchAsync<CustomConfigObjectResponse>(RouteHelper.PatchCustomConfigObject + customConfigObjectId, patchDoc);
        }

        public static EntityWithStatus<CustomConfigObjectResponse> GetCustomConfigObject(HttpClient client, int customConfigObjectId)
        {
            return client.GetAsync<CustomConfigObjectResponse>(RouteHelper.GetCustomConfigObject + customConfigObjectId);
        }

        public static EntityWithStatus<CustomConfigObjectGetResponse> GetPublicCustomConfigObjects(HttpClient client, CustomConfigObjectGetRequest request)
        {
            return client.SearchAsync<CustomConfigObjectGetResponse>(RouteHelper.GetPublicCustomObjects + "?", request);
        }

        public static EntityWithStatus<CustomConfigObjectGetResponse> GetPrivateCustomConfigObjects(HttpClient client, CustomConfigObjectGetRequest request)
        {
            return client.SearchAsync<CustomConfigObjectGetResponse>(RouteHelper.GetPrivateCustomObjects + "?", request);
        }

        public static HttpResponseMessage DeleteCustomConfigObject(HttpClient client, int customConfigObjectId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteCustomConfigObject + customConfigObjectId).Result;
            return response;
        }
    }
}
