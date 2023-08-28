using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Hearings;

public interface IHearingParticipationRepository : IRepository<HearingParticipation>
{
    Task<bool> DeleteAsync(int id);

    Task<DateTime?> GetLastModifiedDateAsync(int hearingParticipationId);

    Task<bool> CheckHearingParticipationExistenceAsync(int hearingId);

    Task<List<HearingParticipation>> GetHearingParticipationsAsync(int hearingId, ParticipationStatus? status = null);

    Task<HearingParticipation> GetHearingParticipation(int hearingId, int participantId, Guid disputeGuid);
}