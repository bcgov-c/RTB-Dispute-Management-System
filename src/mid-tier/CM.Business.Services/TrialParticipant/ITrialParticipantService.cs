using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Business.Services.Base;

namespace CM.Business.Services.TrialParticipant;

public interface ITrialParticipantService : IServiceBase, ITrialDisputeResolver
{
    Task<PostTrialParticipantResponse> CreateAsync(Guid trialGuid, PostTrialParticipantRequest request);

    Task<Data.Model.TrialParticipant> GetTrialParticipant(Guid trialParticipantGuid);

    Task<PostTrialParticipantResponse> PatchAsync(Guid trialParticipantGuid, PatchTrialParticipantRequest trialParticipantToPatch);

    Task<bool> DeleteAsync(Guid trialParticipantGuid);

    Task<bool> IsAssociatedRecordsExists(Guid trialParticipantGuid);
}