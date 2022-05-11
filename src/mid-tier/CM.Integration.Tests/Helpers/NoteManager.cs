using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Note;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class NoteManager
{
    public static EntityWithStatus<NoteResponse> CreateNote(HttpClient client, Guid disputeGuid, NotePostRequest request)
    {
        return client.PostAsync<NoteResponse>(RouteHelper.PostNote + disputeGuid, request);
    }

    public static EntityWithStatus<NoteResponse> UpdateNote(HttpClient client, int noteId, NotePatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<NotePatchRequest>();
        if (request.NoteContent != null)
        {
            patchDoc.Replace(e => e.NoteContent, request.NoteContent);
        }

        return client.PatchAsync<NoteResponse>(RouteHelper.PatchNote + noteId, patchDoc);
    }

    public static HttpResponseMessage DeleteNote(HttpClient client, int noteId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteNote + noteId).Result;
        return response;
    }

    public static EntityWithStatus<NoteResponse> GetNote(HttpClient client, int noteId)
    {
        return client.GetAsync<NoteResponse>(RouteHelper.GetNote + noteId);
    }

    public static EntityWithStatus<List<NoteResponse>> GetDisputeNotes(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<NoteResponse>>(RouteHelper.GetDisputeNotes + disputeGuid);
    }
}