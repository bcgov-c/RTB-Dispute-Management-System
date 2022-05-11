using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.TrialParticipant;

public interface ITrialParticipantRepository : IRepository<Model.TrialParticipant>
{
    Task<DateTime?> GetLastModifiedDate(Guid guid);

    Task<List<Model.TrialParticipant>> GetByDisputes(Guid disputeGuid);
}