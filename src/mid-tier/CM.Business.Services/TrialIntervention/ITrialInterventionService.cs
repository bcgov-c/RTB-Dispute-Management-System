using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.TrialIntervention;
using CM.Business.Services.Base;

namespace CM.Business.Services.TrialIntervention;

public interface ITrialInterventionService : IServiceBase, ITrialDisputeResolver
{
    Task<PostTrialInterventionResponse> CreateAsync(Guid trialGuid, PostTrialInterventionRequest request);

    Task<Data.Model.TrialIntervention> GetTrialIntervention(Guid trialInterventionGuid);

    Task<PostTrialInterventionResponse> PatchAsync(Guid trialInterventionGuid, PatchTrialInterventionRequest trialInterventionToPatch);

    Task<bool> DeleteAsync(Guid trialInterventionGuid);
}