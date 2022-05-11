using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Note;
using CM.Business.Services.Base;
using CM.Common.Utilities;

namespace CM.Business.Services.Notes;

public interface INoteService : IServiceBase, IDisputeResolver
{
    Task<NoteResponse> CreateAsync(Guid disputeGuid, NotePostRequest request);

    Task<NoteResponse> PatchAsync(int noteId, NotePatchRequest note);

    Task<NoteResponse> GetByIdAsync(int noteId);

    Task<List<NoteResponse>> GetByDisputeGuidAsync(Guid disputeGuid, byte? noteLinkedTo, int index, int count);

    Task<bool> CheckLinkedObjectExistence(NoteLinkedTo noteLinkedTo, int value);

    Task<NotePatchRequest> GetForPatchAsync(int noteId);

    string GetLinkedObjectName(NoteLinkedTo noteLinkedTo);

    Task<bool> DeleteAsync(int noteId);
}