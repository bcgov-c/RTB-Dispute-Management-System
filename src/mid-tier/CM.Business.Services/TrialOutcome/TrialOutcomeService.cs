using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialOutcome;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.TrialOutcome;

public class TrialOutcomeService : CmServiceBase, ITrialOutcomeService
{
    public TrialOutcomeService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostTrialOutcomeResponse> CreateAsync(Guid trialGuid, PostTrialOutcomeRequest request)
    {
        var trialOutcome = MapperService.Map<PostTrialOutcomeRequest, Data.Model.TrialOutcome>(request);
        trialOutcome.TrialGuid = trialGuid;
        trialOutcome.IsDeleted = false;

        var trialOutcomeResult = await UnitOfWork.TrialOutcomeRepository.InsertAsync(trialOutcome);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialOutcome, PostTrialOutcomeResponse>(trialOutcomeResult);
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(Guid trialOutcomeGuid)
    {
        var trialOutcome = await UnitOfWork.TrialOutcomeRepository.GetByGuidAsync(trialOutcomeGuid);
        if (trialOutcome != null)
        {
            trialOutcome.IsDeleted = true;
            UnitOfWork.TrialOutcomeRepository.Attach(trialOutcome);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object guid)
    {
        var lastModifiedDate = await UnitOfWork.TrialOutcomeRepository.GetLastModifiedDate((Guid)guid);
        return lastModifiedDate;
    }

    public async Task<Data.Model.TrialOutcome> GetTrialOutcome(Guid trialOutcomeGuid)
    {
        var trialOutcome = await UnitOfWork.TrialOutcomeRepository.GetByGuidAsync(trialOutcomeGuid);
        return trialOutcome;
    }

    public async Task<PostTrialOutcomeResponse> PatchAsync(Guid trialOutcomeGuid, PatchTrialOutcomeRequest trialOutcomeToPatch)
    {
        var trialOutcome = await UnitOfWork.TrialOutcomeRepository.GetByGuidAsync(trialOutcomeGuid);
        MapperService.Map(trialOutcomeToPatch, trialOutcome);

        UnitOfWork.TrialOutcomeRepository.Attach(trialOutcome);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialOutcome, PostTrialOutcomeResponse>(trialOutcome);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(Guid guid)
    {
        var trialOutcome = await UnitOfWork.TrialOutcomeRepository.GetNoTrackingByIdAsync(x => x.TrialOutcomeGuid == guid);
        var entity = await UnitOfWork.TrialDisputeRepository.GetNoTrackingByIdAsync(x => x.TrialDisputeGuid == trialOutcome.TrialDisputeGuid);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}