using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.TrialOutcome;

public interface ITrialOutcomeRepository : IRepository<Model.TrialOutcome>
{
    Task<DateTime?> GetLastModifiedDate(Guid guid);

    Task<List<Model.TrialOutcome>> GetByTrialDisputes(Guid trialDisputeGuid);

    Task<bool> IsAssociatedOutcomeExistsByParty(Guid trialParticipantGuid);

    Task<bool> IsAssociatedOutcomeExistsByDispute(Guid trialDisputeGuid);
}