using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Parties;

public interface IParticipantRepository : IRepository<Participant>
{
    Task<bool> DeleteAsync(int id);

    Task<List<Participant>> GetDisputeParticipantsAsync(Guid disputeGuid);

    Task<List<Participant>> GetDisputeActiveParticipantsAsync(Guid disputeGuid);

    Task<List<Participant>> GetActiveApplicantsAsync(Guid disputeGuid);

    Task<List<Participant>> GetActiveRespondentsAsync(Guid disputeGuid);

    Task<List<Participant>> GetRespondentsAsync(Guid disputeGUid);

    Task<Participant> GetPrimaryApplicantAsync(Guid disputeGuid);

    Task<Participant> GetPrimaryApplicantByIdAsync(int participantId);

    Task<DateTime?> GetLastModifiedDateAsync(int participantId);

    Task<bool> CheckIfAccessCodeExists(string evidenceCode);

    Task<Participant> GetByAccessCode(string accessCode);

    Task<Participant> GetByAccessCodeWithDispute(string accessCode);

    Task<bool> CheckDisputeParticipant(int participantId, Guid disputeGuid);

    Task<Participant> GetWithUser(int id);

    Task<int> GetSameAbbreviationsCount(Guid disputeGuid, string abbreviation);

    Task<Participant> GetDisputeActiveParticipant(Guid disputeGuid, int submitterId);

    Task<bool> IsActiveParticipantExists(int descriptionBy);
}