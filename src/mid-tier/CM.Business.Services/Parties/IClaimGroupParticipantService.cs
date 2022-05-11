using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Parties;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.Parties;

public interface IClaimGroupParticipantService : IServiceBase, IDisputeResolver
{
    Task<List<ClaimGroupParticipantResponse>> CreateAsync(int id, IEnumerable<ClaimGroupParticipantRequest> claimGroupParticipants);

    Task<bool> DeleteAsync(int id);

    Task<ClaimGroupParticipantResponse> PatchAsync(ClaimGroupParticipant claimGroupParticipant);

    Task<List<DisputeClaimGroupParticipantResponse>> GetDisputeClaimParticipantsAsync(Guid disputeGuid);

    Task<ClaimGroupParticipant> GetNoTrackingClaimGroupParticipantsAsync(int id);
}