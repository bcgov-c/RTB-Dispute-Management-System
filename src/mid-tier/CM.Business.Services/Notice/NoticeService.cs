using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Notice;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Notice;

public class NoticeService : CmServiceBase, INoticeService
{
    public NoticeService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.NoticeRepository.GetNoTrackingByIdAsync(x => x.NoticeId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<NoticeResponse> CreateAsync(Guid disputeGuid, NoticePostRequest request)
    {
        var lastVersionNumber = await UnitOfWork.NoticeRepository.GetLastVersionNumberAsync(disputeGuid) ?? 0;

        var newNotice = MapperService.Map<NoticePostRequest, Data.Model.Notice>(request);
        newNotice.DisputeGuid = disputeGuid;
        newNotice.NoticeVersion = ++lastVersionNumber;
        newNotice.IsDeleted = false;
        var noticeResult = await UnitOfWork.NoticeRepository.InsertAsync(newNotice);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            if (request.NoticeAssociatedTo is null or (byte)ParticipantRole.Applicant or (byte)ParticipantRole.Respondent)
            {
                await CreateNoticeServices(request.NoticeAssociatedTo, newNotice.NoticeId, disputeGuid);
            }

            return MapperService.Map<Data.Model.Notice, NoticeResponse>(noticeResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int noticeId)
    {
        var notice = await UnitOfWork.NoticeRepository.GetByIdAsync(noticeId);
        if (notice != null)
        {
            notice.IsDeleted = true;
            UnitOfWork.NoticeRepository.Attach(notice);

            var marked = await MarkForUpdateChildEntities(noticeId);

            if (marked)
            {
                var result = await UnitOfWork.Complete();

                return result.CheckSuccess();
            }

            return false;
        }

        return false;
    }

    public async Task<Data.Model.Notice> PatchAsync(Data.Model.Notice notice)
    {
        UnitOfWork.NoticeRepository.Attach(notice);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return notice;
        }

        return null;
    }

    public async Task<Data.Model.Notice> GetNoTrackingNoticeAsync(int noticeId)
    {
        var notice = await UnitOfWork.NoticeRepository.GetNoTrackingByIdAsync(r =>
            r.NoticeId == noticeId);
        return notice;
    }

    public async Task<NoticeResponse> GetByIdAsync(int noticeId)
    {
        var notice = await UnitOfWork.NoticeRepository.GetNoticeWithIncludedAsync(noticeId);
        if (notice != null)
        {
            return MapperService.Map<Data.Model.Notice, NoticeResponse>(notice);
        }

        return null;
    }

    public async Task<List<NoticeResponse>> GetByDisputeGuidAsync(Guid disputeGuid)
    {
        var notices = await UnitOfWork.NoticeRepository.GetManyWithIncludedAsync(disputeGuid);
        if (notices != null)
        {
            return MapperService.Map<List<Data.Model.Notice>, List<NoticeResponse>>(notices.ToList());
        }

        return null;
    }

    public async Task<bool> IfChildNoticeServiceExists(int noticeId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.FindAllAsync(cd => cd.NoticeId == noticeId);
        if (noticeService is { Count: > 0 })
        {
            return true;
        }

        return false;
    }

    public async Task<bool> IfDisputeParticipantExists(int? participantId, Guid disputeGuid)
    {
        if (participantId != null)
        {
            var participantExists = await UnitOfWork.ParticipantRepository.CheckDisputeParticipant(participantId.Value, disputeGuid);
            return participantExists;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object noticeId)
    {
        var lastModifiedDate = await UnitOfWork.NoticeRepository.GetLastModifiedDate((int)noticeId);

        return lastModifiedDate;
    }

    public async Task<bool> NoticeExists(int noticeId)
    {
        var notice = await UnitOfWork.NoticeRepository.GetByIdAsync(noticeId);
        if (notice != null)
        {
            return true;
        }

        return false;
    }

    public async Task<bool> GetParentNotice(int parentNoticeId, Guid disputeGuid)
    {
        var notice = await UnitOfWork.NoticeRepository.GetNoTrackingByIdAsync(x => x.NoticeId == parentNoticeId && x.DisputeGuid == disputeGuid);
        if (notice != null)
        {
            return true;
        }

        return false;
    }

    private async System.Threading.Tasks.Task CreateNoticeServices(byte? noticeAssociatedTo, int noticeId, Guid disputeGuid)
    {
        var claimGroups = new List<ClaimGroupParticipant>();

        switch (noticeAssociatedTo)
        {
            case null:
            case (byte)ParticipantRole.Applicant:
            {
                var claimGroupsCollection = await UnitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent && x.DisputeGuid == disputeGuid);
                claimGroups = claimGroupsCollection.ToList();

                break;
            }

            case (byte)ParticipantRole.Respondent:
            {
                var claimGroupsCollection = await UnitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant && x.DisputeGuid == disputeGuid);
                claimGroups = claimGroupsCollection.ToList();

                break;
            }
        }

        var partyIds = claimGroups.Select(x => x.ParticipantId).ToList();

        var selectedParticipants = await UnitOfWork.ParticipantRepository
            .FindAllAsync(x => partyIds.Contains(x.ParticipantId) &&
                               x.ParticipantStatus != (byte)ParticipantStatus.Removed &&
                               x.ParticipantStatus != (byte)ParticipantStatus.Deleted);

        var selectedParticipantIds = selectedParticipants.Select(x => x.ParticipantId).ToList();

        foreach (var participantId in selectedParticipantIds)
        {
            var newNoticeService = new Data.Model.NoticeService
            {
                NoticeId = noticeId,
                ParticipantId = participantId,
                IsDeleted = false,
                IsServed = null
            };
            await UnitOfWork.NoticeServiceRepository.InsertAsync(newNoticeService);
        }

        await UnitOfWork.Complete();
    }

    private async Task<bool> MarkForUpdateChildEntities(int noticeId)
    {
        try
        {
            var noticeServices = await UnitOfWork.NoticeServiceRepository.FindAllAsync(x => x.NoticeId == noticeId);
            var fileDescriptions = noticeServices.Where(x => x.ProofFileDescriptionId != null).Select(x => x.ProofFileDescriptionId);

            foreach (var noticeService in noticeServices)
            {
                noticeService.IsDeleted = true;
                UnitOfWork.NoticeServiceRepository.Attach(noticeService);
            }

            foreach (var fileDescriptionId in fileDescriptions)
            {
                var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId.Value);
                fileDescription.IsDeficient = true;
                fileDescription.IsDeficientReason = $"Service record removed by system because Notice was deleted on {DateTime.Now.ToPstDateTime()} PST";
                UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
            }
        }
        catch (Exception)
        {
            return false;
        }

        return true;
    }
}