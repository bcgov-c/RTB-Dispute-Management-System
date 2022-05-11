using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.TrialOutcome;
using CM.Business.Services.Base;

namespace CM.Business.Services.TrialOutcome;

public interface ITrialOutcomeService : IServiceBase, ITrialDisputeResolver
{
    Task<PostTrialOutcomeResponse> CreateAsync(Guid trialGuid, PostTrialOutcomeRequest request);

    Task<Data.Model.TrialOutcome> GetTrialOutcome(Guid trialOutcomeGuid);

    Task<PostTrialOutcomeResponse> PatchAsync(Guid trialOutcomeGuid, PatchTrialOutcomeRequest trialOutcomeToPatch);

    Task<bool> DeleteAsync(Guid trialOutcomeGuid);
}