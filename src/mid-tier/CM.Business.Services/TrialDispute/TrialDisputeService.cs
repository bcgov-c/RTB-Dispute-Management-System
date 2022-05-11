using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialDispute;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.TrialDispute;

public class TrialDisputeService : CmServiceBase, ITrialDisputeService
{
    public TrialDisputeService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostTrialDisputeResponse> CreateAsync(Guid trialGuid, PostTrialDisputeRequest request)
    {
        var trialDispute = MapperService.Map<PostTrialDisputeRequest, Data.Model.TrialDispute>(request);
        trialDispute.TrialGuid = trialGuid;
        trialDispute.IsDeleted = false;

        var trialDisputeResult = await UnitOfWork.TrialDisputeRepository.InsertAsync(trialDispute);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialDispute, PostTrialDisputeResponse>(trialDisputeResult);
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(Guid trialDisputeGuid)
    {
        var trialDispute = await UnitOfWork.TrialDisputeRepository.GetByGuidAsync(trialDisputeGuid);
        if (trialDispute != null)
        {
            trialDispute.IsDeleted = true;
            UnitOfWork.TrialDisputeRepository.Attach(trialDispute);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object guid)
    {
        var lastModifiedDate = await UnitOfWork.TrialDisputeRepository.GetLastModifiedDate((Guid)guid);
        return lastModifiedDate;
    }

    public async Task<Data.Model.TrialDispute> GetTrialDispute(Guid trialDisputeGuid)
    {
        var trialDispute = await UnitOfWork.TrialDisputeRepository.GetByGuidAsync(trialDisputeGuid);
        return trialDispute;
    }

    public async Task<bool> IsAssociatedRecordsExists(Guid trialDisputeGuid)
    {
        var isAssociatedOutcomeExists = await UnitOfWork.TrialOutcomeRepository.IsAssociatedOutcomeExistsByDispute(trialDisputeGuid);
        var isAssociatedInterventionExists = await UnitOfWork.TrialInterventionRepository.IsAssociatedInterventionExistsByDispute(trialDisputeGuid);

        return isAssociatedInterventionExists || isAssociatedOutcomeExists;
    }

    public async Task<PostTrialDisputeResponse> PatchAsync(Guid trialDisputeGuid, PatchTrialDisputeRequest trialDisputeToPatch)
    {
        var trialDispute = await UnitOfWork.TrialDisputeRepository.GetByGuidAsync(trialDisputeGuid);
        MapperService.Map(trialDisputeToPatch, trialDispute);

        UnitOfWork.TrialDisputeRepository.Attach(trialDispute);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.TrialDispute, PostTrialDisputeResponse>(trialDispute);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(Guid guid)
    {
        var entity = await UnitOfWork.TrialDisputeRepository.GetNoTrackingByIdAsync(x => x.TrialDisputeGuid == guid);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}