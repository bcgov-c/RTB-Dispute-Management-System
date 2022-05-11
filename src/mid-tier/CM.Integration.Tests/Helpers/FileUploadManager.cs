using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using CM.Business.Entities.Models.Files;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class FileUploadManager
{
    public static EntityWithStatus<FileResponse> PostFile(HttpClient client, Guid disputeGuid)
    {
        var request = new UploadFileRequest { FileName = "SampleSchedule_Jan2019", FileType = 1, ChunkNumber = 1, IsChunk = true, IsLast = true };

        using var file = File.OpenRead(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException(), @"TestData/Files/SampleSchedule_Jan2019.csv"));
        using var content = new StreamContent(file);
        using (new MultipartFormDataContent())
        {
            content.Headers.ContentType = new MediaTypeHeaderValue(FileMimeTypes.TextCsv);

            var multipartFormDataContent = new MultipartFormDataContent
            {
                { new StringContent(request.FileName), "\"FileName\"" },
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
}