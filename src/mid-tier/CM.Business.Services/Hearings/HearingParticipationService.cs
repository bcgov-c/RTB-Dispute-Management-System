using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Hearings;

public class HearingParticipationService : CmServiceBase, IHearingParticipationService
{
    private const byte NameAbbreviationLength = 10;

    public HearingParticipationService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<HearingParticipationResponse> CreateAsync(int hearingId, HearingParticipationRequest hearingParticipation)
    {
        var newHearingParticipation = MapperService.Map<HearingParticipationRequest, HearingParticipation>(hearingParticipation);

        newHearingParticipation.HearingId = hearingId;
        newHearingParticipation.IsDeleted = false;
        var nameAbbr = GetNameAbbreviation(hearingParticipation);
        newHearingParticipation.NameAbbreviation = nameAbbr.Truncate(NameAbbreviationLength);

        var hearingParticipationResult = await UnitOfWork.HearingParticipationRepository.InsertAsync(newHearingParticipation);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<HearingParticipation, HearingParticipationResponse>(hearingParticipationResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var hearingParticipationExists = await UnitOfWork.HearingParticipationRepository.CheckHearingParticipationExistenceAsync(id);
        if (hearingParticipationExists)
        {
            var result = await UnitOfWork.HearingParticipationRepository.DeleteAsync(id);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            return result;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object hearingParticipationId)
    {
        var lastModifiedDate = await UnitOfWork.HearingParticipationRepository.GetLastModifiedDateAsync((int)hearingParticipationId);
        return lastModifiedDate;
    }

    public async Task<HearingParticipation> GetNoTrackingHearingParticipationAsync(int id)
    {
        var hearing = await UnitOfWork.HearingParticipationRepository.GetNoTrackingByIdAsync(
            p => p.HearingParticipationId == id);
        return hearing;
    }

    public async Task<HearingParticipationResponse> PatchAsync(HearingParticipation hearingParticipation)
    {
        var nameAbbr = GetNameAbbreviation(hearingParticipation);
        hearingParticipation.NameAbbreviation = nameAbbr.Truncate(NameAbbreviationLength);

        UnitOfWork.HearingParticipationRepository.Attach(hearingParticipation);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<HearingParticipation, HearingParticipationResponse>(hearingParticipation);
        }

        return null;
    }

    public async Task<HearingParticipation> GetHearingParticipation(int hearingId, int participantId, Guid disputeGuid)
    {
        var hearingParticipation = await UnitOfWork.HearingParticipationRepository.GetHearingParticipation(hearingId, participantId, disputeGuid);
        return hearingParticipation;
    }

    #region private

    private static string GetNameAbbreviation(HearingParticipationRequest hearingParticipationRequest)
    {
        return StringExtensions.GetAbbreviation(hearingParticipationRequest.OtherParticipantName);
    }

    private static string GetNameAbbreviation(HearingParticipation hearingParticipation)
    {
        return StringExtensions.GetAbbreviation(hearingParticipation.OtherParticipantName);
    }

    #endregion
}