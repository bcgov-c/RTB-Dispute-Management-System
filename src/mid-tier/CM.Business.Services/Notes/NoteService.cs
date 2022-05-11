using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Note;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.UserResolverService;

namespace CM.Business.Services.Notes;

public class NoteService : CmServiceBase, INoteService
{
    public NoteService(IMapper mapper, IUnitOfWork unitOfWork, IUserResolver userResolver)
        : base(unitOfWork, mapper)
    {
        UserResolver = userResolver;
    }

    private IUserResolver UserResolver { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.NoteRepository.GetNoTrackingByIdAsync(c => c.NoteId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<bool> CheckLinkedObjectExistence(NoteLinkedTo noteLinkedTo, int id)
    {
        switch (noteLinkedTo)
        {
            case NoteLinkedTo.Dispute:
                var dispute = await UnitOfWork.DisputeRepository.GetByIdAsync(id);
                return dispute != null;
            case NoteLinkedTo.Participant:
                var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(id);
                return participant != null;
            case NoteLinkedTo.Claim:
                var claim = await UnitOfWork.ClaimRepository.GetByIdAsync(id);
                return claim != null;
            case NoteLinkedTo.FileDescription:
                var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(id);
                return fileDescription != null;
            case NoteLinkedTo.Notice:
                var notice = await UnitOfWork.NoticeRepository.GetByIdAsync(id);
                return notice != null;
            case NoteLinkedTo.Hearing:
                var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(id);
                return hearing != null;
            case NoteLinkedTo.File1:
            case NoteLinkedTo.File2:
                var file = await UnitOfWork.FileRepository.GetByIdAsync(id);
                return file != null;
            default:
                return false;
        }
    }

    public async Task<NoteResponse> CreateAsync(Guid disputeGuid, NotePostRequest request)
    {
        var userId = UserResolver.GetUserId();
        var internalUser = await UnitOfWork.InternalUserRoleRepository.GetByUserId(userId);

        var newNote = MapperService.Map<NotePostRequest, Note>(request);
        newNote.DisputeGuid = disputeGuid;
        newNote.CreatorGroupRoleId = internalUser?.RoleGroupId;
        newNote.IsDeleted = false;
        var noteResult = await UnitOfWork.NoteRepository.InsertAsync(newNote);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Note, NoteResponse>(noteResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int noteId)
    {
        var note = await UnitOfWork.NoteRepository.GetByIdAsync(noteId);
        if (note != null)
        {
            note.IsDeleted = true;
            UnitOfWork.NoteRepository.Attach(note);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<List<NoteResponse>> GetByDisputeGuidAsync(Guid disputeGuid, byte? noteLinkedTo, int index, int count)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var notes = await UnitOfWork.NoteRepository.GetManyAsync(disputeGuid, noteLinkedTo, index, count);
        if (notes != null)
        {
            return MapperService.Map<List<Note>, List<NoteResponse>>(notes);
        }

        return null;
    }

    public async Task<NoteResponse> GetByIdAsync(int noteId)
    {
        var note = await UnitOfWork.NoteRepository.GetByIdAsync(noteId);
        if (note != null)
        {
            return MapperService.Map<Note, NoteResponse>(note);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object noteId)
    {
        var lastModifiedDate = await UnitOfWork.NoteRepository.GetLastModifiedDate((int)noteId);

        return lastModifiedDate;
    }

    public string GetLinkedObjectName(NoteLinkedTo noteLinkedTo)
    {
        switch (noteLinkedTo)
        {
            case NoteLinkedTo.Dispute:
                return "Dispute";
            case NoteLinkedTo.Participant:
                return "Participant";
            case NoteLinkedTo.Claim:
                return "Claim";
            case NoteLinkedTo.FileDescription:
                return "FileDescription";
            case NoteLinkedTo.Notice:
                return "Notice";
            case NoteLinkedTo.Hearing:
                return "Hearing";
            case NoteLinkedTo.File1:
            case NoteLinkedTo.File2:
                return "File";
            default:
                return "Object";
        }
    }

    public async Task<NotePatchRequest> GetForPatchAsync(int noteId)
    {
        var note = await UnitOfWork.NoteRepository.GetNoTrackingByIdAsync(r => r.NoteId == noteId);
        return MapperService.Map<Note, NotePatchRequest>(note);
    }

    public async Task<NoteResponse> PatchAsync(int noteId, NotePatchRequest notePatchRequest)
    {
        var noteToPatch = await UnitOfWork.NoteRepository.GetNoTrackingByIdAsync(r => r.NoteId == noteId);
        MapperService.Map(notePatchRequest, noteToPatch);

        UnitOfWork.NoteRepository.Attach(noteToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Note, NoteResponse>(noteToPatch);
        }

        return null;
    }
}