using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialIntervention;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.TrialIntervention;

public class TrialInterventionService : CmServiceBase, ITrialInterventionService
{
    public TrialInterventionService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostTrialInterventionResponse> CreateAsync(Guid trialGuid, PostTrialInterventionRequest request)
    {
        var trialIntervention = MapperService.Map<PostTrialInterventionRequest, Data.Model.TrialIntervention>(request);
        trialIntervention.TrialGuid = trialGuid;
        trialIntervention.IsDeleted = false;

        var trialPInterventionResult = await UnitOfWork.TrialInterventionRepository.InsertAsync(trialIntervention);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialIntervention, PostTrialInterventionResponse>(trialPInterventionResult);
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(Guid trialInterventionGuid)
    {
        var trialIntervention = await UnitOfWork.TrialInterventionRepository.GetByGuidAsync(trialInterventionGuid);
        if (trialIntervention != null)
        {
            trialIntervention.IsDeleted = true;
            UnitOfWork.TrialInterventionRepository.Attach(trialIntervention);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object guid)
    {
        var lastModifiedDate = await UnitOfWork.TrialInterventionRepository.GetLastModifiedDate((Guid)guid);
        return lastModifiedDate;
    }

    public async Task<Data.Model.TrialIntervention> GetTrialIntervention(Guid trialInterventionGuid)
    {
        var trialIntervention = await UnitOfWork.TrialInterventionRepository.GetByGuidAsync(trialInterventionGuid);
        return trialIntervention;
    }

    public async Task<PostTrialInterventionResponse> PatchAsync(Guid trialInterventionGuid, PatchTrialInterventionRequest trialInterventionToPatch)
    {
        var trialIntervention = await UnitOfWork.TrialInterventionRepository.GetByGuidAsync(trialInterventionGuid);
        MapperService.Map(trialInterventionToPatch, trialIntervention);

        UnitOfWork.TrialInterventionRepository.Attach(trialIntervention);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialIntervention, PostTrialInterventionResponse>(trialIntervention);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(Guid guid)
    {
        var trialIntervention = await UnitOfWork.TrialInterventionRepository.GetNoTrackingByIdAsync(x => x.TrialInterventionGuid == guid);
        var entity = await UnitOfWork.TrialDisputeRepository.GetNoTrackingByIdAsync(x => x.TrialDisputeGuid == trialIntervention.TrialDisputeGuid);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}