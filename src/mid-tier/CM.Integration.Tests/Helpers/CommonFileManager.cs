using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class CommonFileManager
{
    public static EntityWithStatus<CommonFileResponse> CreateCommonFile(HttpClient client, FileRequest fileRequest)
    {
        var executingAssemblyPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (executingAssemblyPath == null)
        {
            throw new FileNotFoundException("Executing assembly file path not found");
        }

        using var file = File.OpenRead(Path.Combine(executingAssemblyPath, @"TestData/Files/SampleSchedule_Jan2019.csv"));

        using var content = new StreamContent(file);

        using (new MultipartFormDataContent())
        {
            content.Headers.ContentType = new MediaTypeHeaderValue(FileMimeTypes.TextCsv);

            var multipartFormDataContent = new MultipartFormDataContent
            {
                { new StringContent(fileRequest.FileName), "\"FileName\"" },
                { new StringContent(fileRequest.FileType.ToString()), "\"FileType\"" },
                { new StringContent(fileRequest.FilePackageId.ToString()), "\"FilePackageId\"" },
                { content, "\"file\"", "\"SampleSchedule_Jan2019.csv\"" }
            };

            var response = client.PostAsync(RouteHelper.PostCommonFile, multipartFormDataContent).Result;

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new EntityWithStatus<CommonFileResponse> { ResponseMessage = response, ResponseObject = null };
            }

            var result = response.Content.ReadAsAsync<CommonFileResponse>().Result;

            return new EntityWithStatus<CommonFileResponse> { ResponseMessage = response, ResponseObject = result };
        }
    }

    public static EntityWithStatus<List<CommonFileResponse>> GetCommonFiles(HttpClient client)
    {
        return client.GetAsync<List<CommonFileResponse>>(RouteHelper.GetCommonFiles);
    }

    public static EntityWithStatus<CommonFileExternalResponse> GetExternalCommonFiles(HttpClient client)
    {
        return client.GetAsync<CommonFileExternalResponse>(RouteHelper.GetExternalCommonFiles);
    }

    public static HttpResponseMessage DeleteCommonFile(HttpClient client, int commonFileId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteCommonFile + commonFileId).Result;
        return response;
    }

    public static EntityWithStatus<CommonFileResponse> UpdateCommonFile(HttpClient client, int commonFileId, CommonFilePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<CommonFilePatchRequest>();
        patchDoc.Replace(e => e.FileTitle, request.FileTitle);

        return client.PatchAsync<CommonFileResponse>(RouteHelper.PatchCommonFiles + commonFileId, patchDoc);
    }
}