using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.TrialIntervention;

public interface ITrialInterventionRepository : IRepository<Model.TrialIntervention>
{
    Task<DateTime?> GetLastModifiedDate(Guid guid);

    Task<List<Model.TrialIntervention>> GetByTrialDisputes(Guid trialDisputeGuid);

    Task<bool> IsAssociatedInterventionExistsByParty(Guid trialParticipantGuid);

    Task<bool> IsAssociatedInterventionExistsByDispute(Guid trialDisputeGuid);
}