using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Files;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class FilePackageManager
{
    public static EntityWithStatus<FilePackageResponse> CreateFilePackage(HttpClient client, Guid disputeGuid, FilePackageRequest request)
    {
        return client.PostAsync<FilePackageResponse>(RouteHelper.PostFilePackage + disputeGuid, request);
    }

    public static EntityWithStatus<FilePackageResponse> UpdateFilePackage(HttpClient client, int filePackageId, FilePackagePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<FilePackagePatchRequest>();
        if (request.PackageTitle != null)
        {
            patchDoc.Replace(e => e.PackageTitle, request.PackageTitle);
        }

        if (request.PackageDescription != null)
        {
            patchDoc.Replace(e => e.PackageDescription, request.PackageDescription);
        }

        return client.PatchAsync<FilePackageResponse>(RouteHelper.PatchFilePackage + filePackageId, patchDoc);
    }

    public static HttpResponseMessage DeleteFilePackage(HttpClient client, int filePackageId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteFilePackage + filePackageId).Result;
        return response;
    }

    public static EntityWithStatus<FilePackageResponse> GetFilePackage(HttpClient client, int filePackageId)
    {
        return client.GetAsync<FilePackageResponse>(RouteHelper.GetFilePackage + filePackageId);
    }

    public static EntityWithStatus<List<FilePackageResponse>> GetDisputeFilePackages(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<FilePackageResponse>>(RouteHelper.GetDisputeFilePackages + disputeGuid);
    }
}