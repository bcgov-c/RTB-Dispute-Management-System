using System;
using System.Net.Http;
using CM.Business.Entities.Models.Files;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class FileInfoManager
{
    public static EntityWithStatus<FileInfoPatchResponse> UpdateFileInfo(HttpClient client, int fileId, FileInfoPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<FileInfoPatchRequest>();
        if (request.FileConsidered != null)
        {
            patchDoc.Replace(e => e.FileConsidered, request.FileConsidered);
        }

        if (request.FileName != null)
        {
            patchDoc.Replace(e => e.FileName, request.FileName);
        }

        return client.PatchAsync<FileInfoPatchResponse>(RouteHelper.PatchFileInfo + fileId, patchDoc);
    }

    public static EntityWithStatus<FileInfoResponse> GetFileInfo(HttpClient client, int fileId)
    {
        return client.GetAsync<FileInfoResponse>(RouteHelper.GetFileInfo + fileId);
    }

    public static EntityWithStatus<DisputeFileInfoResponse> GetDisputeFileInfos(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<DisputeFileInfoResponse>(RouteHelper.GetDisputeFileInfos + disputeGuid);
    }
}