using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.TrialIntervention;

public class TrialInterventionRepository : CmRepository<Model.TrialIntervention>, ITrialInterventionRepository
{
    public TrialInterventionRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.TrialIntervention>> GetByTrialDisputes(Guid trialDisputeGuid)
    {
        var trialInterventions = await Context
            .TrialInterventions
            .Where(x => x.TrialDisputeGuid == trialDisputeGuid)
            .ToListAsync();

        return trialInterventions;
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid guid)
    {
        var lastModifiedDate = await Context.TrialInterventions
            .Where(d => d.TrialInterventionGuid == guid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }

    public async Task<bool> IsAssociatedInterventionExistsByDispute(Guid trialDisputeGuid)
    {
        var isAssociatedRecordExists = await Context.TrialInterventions.AnyAsync(x => x.TrialDisputeGuid == trialDisputeGuid);
        return isAssociatedRecordExists;
    }

    public async Task<bool> IsAssociatedInterventionExistsByParty(Guid trialParticipantGuid)
    {
        var isAssociatedRecordExists = await Context.TrialInterventions.AnyAsync(x => x.TrialParticipantGuid == trialParticipantGuid);
        return isAssociatedRecordExists;
    }
}