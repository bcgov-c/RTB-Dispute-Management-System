using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;

namespace CM.Integration.Tests.Helpers;

public static class FileManager
{
    public static EntityWithStatus<FileResponse> CreateFile(HttpClient client, Guid disputeGuid, FileRequest fileRequest)
    {
        using var file = File.OpenRead(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException(), @"TestData/Files/SampleSchedule_Jan2019.csv"));
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

            var response = client.PostAsync(RouteHelper.FileUpload + disputeGuid, multipartFormDataContent).Result;

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new EntityWithStatus<FileResponse> { ResponseMessage = response, ResponseObject = null };
            }

            var result = response.Content.ReadAsAsync<FileResponse>().Result;

            return new EntityWithStatus<FileResponse> { ResponseMessage = response, ResponseObject = result };
        }
    }

    public static EntityWithStatus<FileResponse> CreatePdfFile(HttpClient client, Guid disputeGuid, FileRequest fileRequest)
    {
        using var file = File.OpenRead(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException(), @"TestData/Files/OtherFile1.pdf"));
        using var content = new StreamContent(file);

        using (new MultipartFormDataContent())
        {
            content.Headers.ContentType = new MediaTypeHeaderValue(FileMimeTypes.Pdf);

            var multipartFormDataContent = new MultipartFormDataContent
            {
                { new StringContent(fileRequest.FileName), "\"FileName\"" },
                { new StringContent(fileRequest.FileType.ToString()), "\"FileType\"" },
                { new StringContent(fileRequest.FilePackageId.ToString()), "\"FilePackageId\"" },
                { content, "\"file\"", "\"OtherFile1.pdf\"" }
            };

            var response = client.PostAsync(RouteHelper.FileUpload + disputeGuid, multipartFormDataContent).Result;

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new EntityWithStatus<FileResponse> { ResponseMessage = response, ResponseObject = null };
            }

            var result = response.Content.ReadAsAsync<FileResponse>().Result;

            return new EntityWithStatus<FileResponse> { ResponseMessage = response, ResponseObject = result };
        }
    }

    public static HttpResponseMessage DeleteFile(HttpClient client, int fileId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteFile + fileId).Result;

        return response;
    }

    public static FileStreamWithStatus GetFile(HttpClient client, string url, int fileId, string token)
    {
        var encodedToken = Converters.EncodeTokenToBase64(token, fileId);
        var subStrings = url.Split("/");
        var effectiveUrl = subStrings[3] + "/" + subStrings[4];

        return client.GetFileAsync(RouteHelper.GetFile + effectiveUrl + "?token=" + encodedToken);
    }

    public static EntityWithStatus<FileResponse> CreatePdfFromHtml(HttpClient client, Guid disputeGuid, PdfFileRequest request)
    {
        return client.PostAsync<FileResponse>(RouteHelper.PostPdfFromHtml + disputeGuid, request);
    }
}