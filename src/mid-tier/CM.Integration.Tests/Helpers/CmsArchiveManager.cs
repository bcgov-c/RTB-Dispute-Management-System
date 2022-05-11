using System.Net.Http;
using CM.Business.Entities.Models.CmsArchive;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class CmsArchiveManager
{
    public static EntityWithStatus<CmsArchiveSearchResponse> GetCmsArchive(HttpClient client, CmsArchiveSearchRequest request)
    {
        return client.GetAsync<CmsArchiveSearchResponse>(RouteHelper.CmsArchiveSearch, request);
    }

    public static EntityWithStatus<CmsArchiveSearchResponse> GetRecordCmsArchive(HttpClient client, string fileNumber)
    {
        return client.GetAsync<CmsArchiveSearchResponse>(RouteHelper.GetRecordCmsArchive + fileNumber);
    }

    public static EntityWithStatus<CmsArchiveNoteResponse> PostNoteCmsArchive(HttpClient client, string fileNumber, CmsArchiveNoteRequest request)
    {
        return client.PostAsync<CmsArchiveNoteResponse>(RouteHelper.PostNoteCmsArchive + fileNumber, request);
    }

    public static EntityWithStatus<CmsArchiveSearchResponse> GetFileCmsArchive(HttpClient client, string url, string token)
    {
        return client.GetAsync<CmsArchiveSearchResponse>(RouteHelper.GetFileCmsArchive + url + "?token=" + token);
    }

    public static EntityWithStatus<CmsRecordResponse> UpdateRecordCmsArchive(HttpClient client, string fileNumber, CmsRecordRequest request)
    {
        var patchDoc = new JsonPatchDocument<CmsRecordRequest>();
        if (request.DMS_File_Number != null)
        {
            patchDoc.Replace(e => e.DMS_File_Number, request.DMS_File_Number);
        }

        return client.PatchAsync<CmsRecordResponse>(RouteHelper.PatchRecordCmsArchive + fileNumber, patchDoc);
    }
}