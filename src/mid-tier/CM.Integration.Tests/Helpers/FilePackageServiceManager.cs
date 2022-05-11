using System.Net.Http;
using CM.Business.Entities.Models.FilePackageService;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class FilePackageServiceManager
{
    public static EntityWithStatus<FilePackageServiceResponse> CreateFilePackageService(HttpClient client, int filePackageId, FilePackageServiceRequest request)
    {
        return client.PostAsync<FilePackageServiceResponse>(RouteHelper.PostFilePackageService + filePackageId, request);
    }

    public static EntityWithStatus<FilePackageServiceResponse> UpdateFilePackageService(HttpClient client, int filePackageServiceId, FilePackageServicePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<FilePackageServicePatchRequest>();
        if (request.ServiceMethod != null)
        {
            patchDoc.Replace(e => e.ServiceMethod, request.ServiceMethod);
        }

        if (request.ServiceComment != null)
        {
            patchDoc.Replace(e => e.ServiceComment, request.ServiceComment);
        }

        return client.PatchAsync<FilePackageServiceResponse>(RouteHelper.PatchFilePackageService + filePackageServiceId, patchDoc);
    }

    public static HttpResponseMessage DeleteFilePackageService(HttpClient client, int filePackageServiceId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteFilePackageService + filePackageServiceId).Result;
        return response;
    }
}