using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Trial;
using CM.Business.Entities.Models.TrialDispute;

namespace CM.Business.Services.Trial;

public interface ITrialService : IServiceBase
{
    Task<PostTrialResponse> CreateAsync(PostTrialRequest request);

    Task<Data.Model.Trial> GetTrial(Guid associatedTrialGuid);

    Task<PostTrialResponse> PatchAsync(Guid trialGuid, PatchTrialRequest trialToPatch);

    Task<bool> DeleteAsync(Guid trialGuid);

    Task<List<PostTrialResponse>> GetAll();

    Task<List<TrialDisputeGetResponse>> GetDisputeTrials(Guid disputeGuid);
}