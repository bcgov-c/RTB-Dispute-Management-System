using System.Net.Http;
using CM.Business.Entities.Models.NoticeService;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class NoticeServiceManager
{
    public static EntityWithStatus<NoticeServiceResponse> CreateNoticeService(HttpClient client, int noticeId, NoticeServiceRequest request)
    {
        return client.PostAsync<NoticeServiceResponse>(RouteHelper.PostNoticeService + noticeId, request);
    }

    public static EntityWithStatus<NoticeServiceResponse> UpdateNoticeService(HttpClient client, int noticeServiceId, NoticeServicePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<NoticeServicePatchRequest>();
        if (request.ServiceComment != null)
        {
            patchDoc.Replace(e => e.ServiceComment, request.ServiceComment);
        }

        return client.PatchAsync<NoticeServiceResponse>(RouteHelper.PatchNoticeService + noticeServiceId, patchDoc);
    }

    public static HttpResponseMessage DeleteNoticeService(HttpClient client, int noticeServiceId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteNoticeService + noticeServiceId).Result;
        return response;
    }
}