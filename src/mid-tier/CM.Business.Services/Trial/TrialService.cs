using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Trial;
using CM.Business.Entities.Models.TrialDispute;
using CM.Business.Entities.Models.TrialIntervention;
using CM.Business.Entities.Models.TrialOutcome;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Trial;

public class TrialService : CmServiceBase, ITrialService
{
    public TrialService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostTrialResponse> CreateAsync(PostTrialRequest request)
    {
        var trial = MapperService.Map<PostTrialRequest, Data.Model.Trial>(request);
        trial.IsDeleted = false;

        var trialResult = await UnitOfWork.TrialRepository.InsertAsync(trial);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.Trial, PostTrialResponse>(trialResult);
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(Guid trialGuid)
    {
        var trial = await UnitOfWork.TrialRepository.GetByGuidAsync(trialGuid);
        if (trial != null)
        {
            trial.IsDeleted = true;
            UnitOfWork.TrialRepository.Attach(trial);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<List<PostTrialResponse>> GetAll()
    {
        var trials = await UnitOfWork.TrialRepository.GetAllAsync();
        var res = MapperService.Map<List<Data.Model.Trial>, List<PostTrialResponse>>((List<Data.Model.Trial>)trials);

        return res;
    }

    public async Task<List<TrialDisputeGetResponse>> GetDisputeTrials(Guid disputeGuid)
    {
        var result = new List<TrialDisputeGetResponse>();
        var trialDisputes = await UnitOfWork.TrialDisputeRepository.GetByDisputeGuid(disputeGuid);

        result = MapperService.Map<List<Data.Model.TrialDispute>, List<TrialDisputeGetResponse>>(trialDisputes);

        foreach (var item in result)
        {
            var trialParticipants = await UnitOfWork.TrialParticipantRepository.GetByDisputes(item.DisputeGuid);
            item.TrialParticipants = MapperService.Map<List<Data.Model.TrialParticipant>, List<TrialParticipantGetResponse>>(trialParticipants);

            var trialInterventions = await UnitOfWork.TrialInterventionRepository.GetByTrialDisputes(item.TrialDisputeGuid);
            item.TrialInterventions = MapperService.Map<List<Data.Model.TrialIntervention>, List<TrialInterventionGetResponse>>(trialInterventions);

            var trialOutcomes = await UnitOfWork.TrialOutcomeRepository.GetByTrialDisputes(item.TrialDisputeGuid);
            item.TrialOutcomes = MapperService.Map<List<Data.Model.TrialOutcome>, List<TrialOutcomeGetResponse>>(trialOutcomes);
        }

        return result;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object guid)
    {
        var lastModifiedDate = await UnitOfWork.TrialRepository.GetLastModifiedDate((Guid)guid);
        return lastModifiedDate;
    }

    public async Task<Data.Model.Trial> GetTrial(Guid associatedTrialGuid)
    {
        var trial = await UnitOfWork.TrialRepository.GetByGuidAsync(associatedTrialGuid);
        return trial;
    }

    public async Task<PostTrialResponse> PatchAsync(Guid trialGuid, PatchTrialRequest trialToPatch)
    {
        var trial = await UnitOfWork.TrialRepository.GetByGuidAsync(trialGuid);
        MapperService.Map(trialToPatch, trial);

        UnitOfWork.TrialRepository.Attach(trial);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.Trial, PostTrialResponse>(trial);

            return res;
        }

        return null;
    }
}