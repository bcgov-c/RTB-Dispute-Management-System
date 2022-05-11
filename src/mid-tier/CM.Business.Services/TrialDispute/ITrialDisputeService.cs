using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.TrialDispute;
using CM.Business.Services.Base;

namespace CM.Business.Services.TrialDispute;

public interface ITrialDisputeService : IServiceBase, ITrialDisputeResolver
{
    Task<PostTrialDisputeResponse> CreateAsync(Guid trialGuid, PostTrialDisputeRequest request);

    Task<Data.Model.TrialDispute> GetTrialDispute(Guid trialDisputeGuid);

    Task<PostTrialDisputeResponse> PatchAsync(Guid trialDisputeGuid, PatchTrialDisputeRequest trialDisputeToPatch);

    Task<bool> DeleteAsync(Guid trialDisputeGuid);

    Task<bool> IsAssociatedRecordsExists(Guid trialDisputeGuid);
}