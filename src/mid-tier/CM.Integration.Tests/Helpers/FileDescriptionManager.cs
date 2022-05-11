using System;
using System.Net.Http;
using CM.Business.Entities.Models.Files;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class FileDescriptionManager
{
    public static EntityWithStatus<FileDescriptionResponse> CreateFileDescription(HttpClient client, Guid disputeGuid, FileDescriptionRequest request)
    {
        return client.PostAsync<FileDescriptionResponse>(RouteHelper.PostFileDescription + disputeGuid, request);
    }

    public static EntityWithStatus<FileDescriptionResponse> UpdateFileDescription(HttpClient client, int fileDescriptionId, FileDescriptionRequest request)
    {
        var patchDoc = new JsonPatchDocument<FileDescriptionRequest>();
        if (request.ClaimId != null)
        {
            patchDoc.Replace(e => e.ClaimId, request.ClaimId);
        }

        if (request.Description != null)
        {
            patchDoc.Replace(e => e.Description, request.Description);
        }

        return client.PatchAsync<FileDescriptionResponse>(RouteHelper.PatchFileDescription + fileDescriptionId, patchDoc);
    }

    public static HttpResponseMessage DeleteFileDescription(HttpClient client, int fileDescriptionId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteFileDescription + fileDescriptionId).Result;
        return response;
    }

    public static EntityWithStatus<FileDescriptionResponse> GetFileDescription(HttpClient client, int fileDescriptionId)
    {
        return client.GetAsync<FileDescriptionResponse>(RouteHelper.GetFileDescription + fileDescriptionId);
    }

    public static EntityWithStatus<FileDescriptionListResponse> GetDisputeFileDescriptions(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<FileDescriptionListResponse>(RouteHelper.GetDisputeFileDescriptions + disputeGuid);
    }
}