using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using CM.Business.Entities.Models.ExternalFile;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.IdentityModel.Tokens;

namespace CM.Integration.Tests.Helpers;

public static class ExternalFileManager
{
    public static EntityWithStatus<ExternalFileResponse> CreateExternalFile(HttpClient client, int externalCustomDataObjectId, ExternalFileRequest request)
    {
        using var file = File.OpenRead(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException(), @"TestData/Files/SampleSchedule_Jan2019.csv"));
        using var content = new StreamContent(file);

        using (new MultipartFormDataContent())
        {
            content.Headers.ContentType = new MediaTypeHeaderValue(FileMimeTypes.TextCsv);

            var multipartFormDataContent = new MultipartFormDataContent
            {
                { new StringContent(request.FileName), "\"FileName\"" },
                { new StringContent(request.FileType.ToString()), "\"FileType\"" },
                { content, "\"file\"", "\"SampleSchedule_Jan2019.csv\"" }
            };

            var response = client.PostAsync(string.Format(RouteHelper.PostExternalFile, externalCustomDataObjectId), multipartFormDataContent).Result;

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new EntityWithStatus<ExternalFileResponse> { ResponseMessage = response, ResponseObject = null };
            }

            var result = response.Content.ReadAsAsync<ExternalFileResponse>().Result;

            return new EntityWithStatus<ExternalFileResponse> { ResponseMessage = response, ResponseObject = result };
        }
    }

    public static EntityWithStatus<ExternalFileResponse> UpdateExternalFile(HttpClient client, int externalFileId, ExternalFilePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalFilePatchRequest>();
        if (!string.IsNullOrEmpty(request.FileTitle))
        {
            patchDoc.Replace(e => e.FileTitle, request.FileTitle);
        }

        return client.PatchAsync<ExternalFileResponse>(string.Format(RouteHelper.PatchExternalFile, externalFileId), patchDoc);
    }

    public static HttpResponseMessage DeleteExternalFile(HttpClient client, int externalFileId)
    {
        var response = client.DeleteAsync(string.Format(RouteHelper.DeleteExternalFile, externalFileId)).Result;
        return response;
    }

    public static EntityWithStatus<List<ExternalFileResponse>> GetExternalFiles(HttpClient client, int externalCustomDataObjectId)
    {
        return client.GetAsync<List<ExternalFileResponse>>(RouteHelper.GetExternalFiles + externalCustomDataObjectId);
    }

    public static EntityWithStatus<ExternalFileResponse> CreatePdfFromHtml(HttpClient client, int externalCustomDataObjectId, ExternalFileRequest request)
    {
        return client.PostAsync<ExternalFileResponse>(RouteHelper.PostPdfFromHtmlExternal + externalCustomDataObjectId, request);
    }

    #region One time token

    public static string CreateToken()
    {
        var sessionGuid = Guid.NewGuid();
        const string keyVal = "secret-key-keep-it-safe";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(keyVal);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("id", sessionGuid.ToString()) }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public static EntityWithStatus<ExternalFileResponse> CreateExternalFile(HttpClient client, string token, int externalCustomDataObjectId, ExternalFileRequest request)
    {
        using var file = File.OpenRead(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? throw new InvalidOperationException(), @"TestData/Files/SampleSchedule_Jan2019.csv"));
        using var content = new StreamContent(file);

        using (new MultipartFormDataContent())
        {
            content.Headers.ContentType = new MediaTypeHeaderValue(FileMimeTypes.TextCsv);

            var multipartFormDataContent = new MultipartFormDataContent
            {
                { new StringContent(request.FileName), "\"FileName\"" },
                { new StringContent(request.FileType.ToString()), "\"FileType\"" },
                { content, "\"file\"", "\"SampleSchedule_Jan2019.csv\"" }
            };

            var response = client.PostAsync(string.Format(RouteHelper.PostExternalFileOtt, externalCustomDataObjectId, token), multipartFormDataContent).Result;

            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new EntityWithStatus<ExternalFileResponse> { ResponseMessage = response, ResponseObject = null };
            }

            var result = response.Content.ReadAsAsync<ExternalFileResponse>().Result;

            return new EntityWithStatus<ExternalFileResponse> { ResponseMessage = response, ResponseObject = result };
        }
    }

    public static EntityWithStatus<ExternalFileResponse> UpdateExternalFile(HttpClient client, string token, int externalFileId, ExternalFilePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalFilePatchRequest>();
        if (string.IsNullOrEmpty(request.FileTitle))
        {
            patchDoc.Replace(e => e.FileTitle, request.FileTitle);
        }

        return client.PatchAsync<ExternalFileResponse>(string.Format(RouteHelper.PatchExternalFileOtt, externalFileId, token), patchDoc);
    }

    public static HttpResponseMessage DeleteExternalFile(HttpClient client, string token, int externalFileId)
    {
        var response = client.DeleteAsync(string.Format(RouteHelper.DeleteExternalFileOtt, externalFileId, token)).Result;
        return response;
    }

    public static FileStreamWithStatus GetExternalFileByUrl(HttpClient client, string url, int externalFileId, string token)
    {
        var encodedToken = Converters.EncodeTokenToBase64(token, externalFileId);
        var subStrings = url.Split("/");
        var effectiveUrl = subStrings[3] + "/" + subStrings[4];

        return client.GetFileAsync(RouteHelper.GetExternalFileByUrl + effectiveUrl + "?token=" + encodedToken);
    }

    public static EntityWithStatus<ExternalFileResponse> CreatePdfFromHtml(HttpClient client, string token, int externalCustomDataObjectId, ExternalFileRequest request)
    {
        return client.PostAsync<ExternalFileResponse>(string.Format(RouteHelper.PostPdfFromHtmlExternalOtt, externalCustomDataObjectId, token), request);
    }

    #endregion
}