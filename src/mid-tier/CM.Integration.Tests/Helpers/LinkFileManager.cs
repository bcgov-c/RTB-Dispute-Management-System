using System;
using System.Net.Http;
using CM.Business.Entities.Models.Files;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class LinkFileManager
{
    public static EntityWithStatus<LinkedFileResponse> CreateLinkFile(HttpClient client, Guid disputeGuid, LinkedFileRequest request)
    {
        return client.PostAsync<LinkedFileResponse>(RouteHelper.PostLinkFile + disputeGuid, request);
    }

    public static HttpResponseMessage DeleteLinkFile(HttpClient client, int linkFileId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteLinkFile + linkFileId).Result;
        return response;
    }

    public static EntityWithStatus<LinkedFileListResponse> GetDisputeLinkFiles(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<LinkedFileListResponse>(RouteHelper.GetDisputeLinkFiles + disputeGuid);
    }
}