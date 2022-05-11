using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Parties;

public interface IClaimGroupParticipantRepository : IRepository<ClaimGroupParticipant>
{
    Task<bool> CheckParticipantExistence(int participantId);

    Task<ClaimGroupParticipant> CheckParticipantRelation(int participantId);

    Task<string> GetPrimaryApplicantAccessCode(Guid disputeGuid);

    Task<List<ClaimGroupParticipant>> GetDisputeClaimGroupParticipants(int claimGroupId);

    Task<DateTime?> GetLastModifiedDateAsync(int groupParticipantId);

    Task<List<ClaimGroupParticipant>> GetByClaimGroupIdAsync(int claimGroupId);

    Task<List<int>> GetActiveRespondentParticipants(Guid disputeGuid);

    Task<ClaimGroupParticipant> GetClaimGroupParticipantByParticipantId(int participantId);
}