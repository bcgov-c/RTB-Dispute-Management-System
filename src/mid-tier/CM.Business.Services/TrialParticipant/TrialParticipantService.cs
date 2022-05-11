using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.TrialParticipant;

public class TrialParticipantService : CmServiceBase, ITrialParticipantService
{
    public TrialParticipantService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostTrialParticipantResponse> CreateAsync(Guid trialGuid, PostTrialParticipantRequest request)
    {
        var trialParticipant = MapperService.Map<PostTrialParticipantRequest, Data.Model.TrialParticipant>(request);
        trialParticipant.TrialGuid = trialGuid;
        trialParticipant.IsDeleted = false;

        var trialParticipantResult = await UnitOfWork.TrialParticipantRepository.InsertAsync(trialParticipant);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialParticipant, PostTrialParticipantResponse>(trialParticipantResult);
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(Guid trialParticipantGuid)
    {
        var trialParticipant = await UnitOfWork.TrialParticipantRepository.GetByGuidAsync(trialParticipantGuid);
        if (trialParticipant != null)
        {
            trialParticipant.IsDeleted = true;
            UnitOfWork.TrialParticipantRepository.Attach(trialParticipant);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object guid)
    {
        var lastModifiedDate = await UnitOfWork.TrialParticipantRepository.GetLastModifiedDate((Guid)guid);
        return lastModifiedDate;
    }

    public async Task<Data.Model.TrialParticipant> GetTrialParticipant(Guid trialParticipantGuid)
    {
        var trialParticipant = await UnitOfWork.TrialParticipantRepository.GetByGuidAsync(trialParticipantGuid);
        return trialParticipant;
    }

    public async Task<bool> IsAssociatedRecordsExists(Guid trialParticipantGuid)
    {
        var isAssociatedOutcomeExists = await UnitOfWork.TrialOutcomeRepository.IsAssociatedOutcomeExistsByParty(trialParticipantGuid);
        var isAssociatedInterventionExists = await UnitOfWork.TrialInterventionRepository.IsAssociatedInterventionExistsByParty(trialParticipantGuid);

        return isAssociatedInterventionExists || isAssociatedOutcomeExists;
    }

    public async Task<PostTrialParticipantResponse> PatchAsync(Guid trialParticipantGuid, PatchTrialParticipantRequest trialParticipantToPatch)
    {
        var trialParticipant = await UnitOfWork.TrialParticipantRepository.GetByGuidAsync(trialParticipantGuid);
        MapperService.Map(trialParticipantToPatch, trialParticipant);

        UnitOfWork.TrialParticipantRepository.Attach(trialParticipant);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialParticipant, PostTrialParticipantResponse>(trialParticipant);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(Guid guid)
    {
        var trialParticipant = await UnitOfWork.TrialParticipantRepository.GetNoTrackingByIdAsync(x => x.TrialParticipantGuid == guid);
        var entity = await UnitOfWork.TrialDisputeRepository.GetNoTrackingByIdAsync(x => x.DisputeGuid == trialParticipant.DisputeGuid);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}