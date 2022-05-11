using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Notice;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class NoticeManager
{
    public static EntityWithStatus<NoticeResponse> CreateNotice(HttpClient client, Guid disputeGuid, NoticePostRequest request)
    {
        return client.PostAsync<NoticeResponse>(RouteHelper.PostNotice + disputeGuid, request);
    }

    public static EntityWithStatus<NoticeResponse> UpdateNotice(HttpClient client, int noticeId, NoticePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<NoticePatchRequest>();
        if (request.HearingType != null)
        {
            patchDoc.Replace(e => e.HearingType, request.HearingType);
        }

        return client.PatchAsync<NoticeResponse>(RouteHelper.PatchNotice + noticeId, patchDoc);
    }

    public static HttpResponseMessage DeleteNotice(HttpClient client, int noticeId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteNotice + noticeId).Result;
        return response;
    }

    public static EntityWithStatus<NoticeResponse> GetNotice(HttpClient client, int noticeId)
    {
        return client.GetAsync<NoticeResponse>(RouteHelper.GetNotice + noticeId);
    }

    public static EntityWithStatus<List<NoticeResponse>> GetNotices(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<NoticeResponse>>(RouteHelper.GetDisputeNotices + disputeGuid);
    }
}