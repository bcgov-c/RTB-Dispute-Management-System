using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Parties;

public class ClaimGroupParticipantService : CmServiceBase, IClaimGroupParticipantService
{
    public ClaimGroupParticipantService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityClaimGroupParticipant = await UnitOfWork.ClaimGroupParticipantRepository.GetNoTrackingByIdAsync(x => x.ClaimGroupParticipantId == id);
        if (entityClaimGroupParticipant != null)
        {
            var entity = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(x => x.ClaimGroupId == entityClaimGroupParticipant.ClaimGroupId);
            return entity?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<List<ClaimGroupParticipantResponse>> CreateAsync(int id, IEnumerable<ClaimGroupParticipantRequest> claimGroupParticipants)
    {
        var claimGroup = await UnitOfWork.ClaimGroupRepository.GetByIdAsync(id);
        var disputeGuid = Guid.Empty;
        if (claimGroup != null)
        {
            disputeGuid = claimGroup.DisputeGuid;
        }

        var createdClaimGroupParticipants = new List<ClaimGroupParticipant>();

        foreach (var claimGroupParticipant in claimGroupParticipants)
        {
            var newClaimGroupParticipant =
                MapperService.Map<ClaimGroupParticipantRequest, ClaimGroupParticipant>(claimGroupParticipant);
            newClaimGroupParticipant.ClaimGroupId = id;
            newClaimGroupParticipant.DisputeGuid = disputeGuid;
            newClaimGroupParticipant.IsDeleted = false;

            var result = await UnitOfWork.ClaimGroupParticipantRepository.InsertAsync(newClaimGroupParticipant);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            if (completeResult.CheckSuccess())
            {
                await CreateNoticeServices(claimGroupParticipant.GroupParticipantRole, claimGroupParticipant.ParticipantId, disputeGuid);
                await CreateFilePackageServices(claimGroupParticipant.ParticipantId, disputeGuid);
            }

            createdClaimGroupParticipants.Add(result);
        }

        return MapperService.Map<List<ClaimGroupParticipant>, List<ClaimGroupParticipantResponse>>(
            createdClaimGroupParticipants);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var claimGroupParticipant = await UnitOfWork.ClaimGroupParticipantRepository.GetByIdAsync(id);
        if (claimGroupParticipant != null)
        {
            claimGroupParticipant.IsDeleted = true;
            UnitOfWork.ClaimGroupParticipantRepository.Attach(claimGroupParticipant);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ClaimGroupParticipantResponse> PatchAsync(ClaimGroupParticipant claimGroupParticipant)
    {
        UnitOfWork.ClaimGroupParticipantRepository.Attach(claimGroupParticipant);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<ClaimGroupParticipant, ClaimGroupParticipantResponse>(claimGroupParticipant);
        }

        return null;
    }

    public async Task<List<DisputeClaimGroupParticipantResponse>> GetDisputeClaimParticipantsAsync(Guid disputeGuid)
    {
        var disputeClaimGroupParticipantResponses = new List<DisputeClaimGroupParticipantResponse>();
        var claimGroups = await UnitOfWork.ClaimGroupRepository.GetDisputeClaimGroupsWithParties(disputeGuid);
        if (claimGroups != null)
        {
            foreach (var claimGroup in claimGroups)
            {
                var disputeParticipantsResponse =
                    MapperService.Map<List<ClaimGroupParticipant>, List<DisputeParticipantResponse>>(claimGroup.ClaimGroupParticipants.ToList());

                var disputeClaimGroupParticipantResponse = new DisputeClaimGroupParticipantResponse
                {
                    ClaimGroupId = claimGroup.ClaimGroupId,
                    Participants = disputeParticipantsResponse
                };
                disputeClaimGroupParticipantResponses.Add(disputeClaimGroupParticipantResponse);
            }
        }

        return disputeClaimGroupParticipantResponses;
    }

    public async Task<ClaimGroupParticipant> GetNoTrackingClaimGroupParticipantsAsync(int id)
    {
        var claimGroupParticipant = await
            UnitOfWork.ClaimGroupParticipantRepository.GetNoTrackingByIdAsync(
                c => c.ClaimGroupParticipantId == id);
        return claimGroupParticipant;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object groupParticipantId)
    {
        var lastModifiedDate = await UnitOfWork.ClaimGroupParticipantRepository.GetLastModifiedDateAsync((int)groupParticipantId);

        return lastModifiedDate;
    }

    private async System.Threading.Tasks.Task CreateNoticeServices(byte claimGroupParticipantRole, int participantId, Guid disputeGuid)
    {
        var notices = new List<Data.Model.Notice>();

        switch (claimGroupParticipantRole)
        {
            case (byte)GroupParticipantRole.Applicant:
                notices = await UnitOfWork.NoticeRepository.GetRespondentNotices(disputeGuid);

                break;
            case (byte)GroupParticipantRole.Respondent:
                notices = await UnitOfWork.NoticeRepository.GetApplicantNotices(disputeGuid);

                break;
        }

        foreach (var notice in notices)
        {
            var newNoticeService = new Data.Model.NoticeService
            {
                NoticeId = notice.NoticeId,
                ParticipantId = participantId,
                IsDeleted = false,
                IsServed = null
            };
            await UnitOfWork.NoticeServiceRepository.InsertAsync(newNoticeService);
        }

        await UnitOfWork.Complete();
    }

    private async System.Threading.Tasks.Task CreateFilePackageServices(int participantId, Guid disputeGuid)
    {
        var filePackages = await UnitOfWork.FilePackageRepository.GetParticipantFilePackages(participantId, disputeGuid);

        foreach (var filePackage in filePackages)
        {
            var newFilePackageService = new Data.Model.FilePackageService
            {
                FilePackageId = filePackage.FilePackageId,
                ParticipantId = participantId,
                IsDeleted = false
            };
            await UnitOfWork.FilePackageServiceRepository.InsertAsync(newFilePackageService);
        }

        await UnitOfWork.Complete();
    }
}