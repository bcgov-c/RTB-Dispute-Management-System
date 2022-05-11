using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.TrialOutcome;

public class TrialOutcomeRepository : CmRepository<Model.TrialOutcome>, ITrialOutcomeRepository
{
    public TrialOutcomeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.TrialOutcome>> GetByTrialDisputes(Guid trialDisputeGuid)
    {
        var trialOutcomes = await Context
            .TrialOutcomes
            .Where(x => x.TrialDisputeGuid == trialDisputeGuid)
            .ToListAsync();

        return trialOutcomes;
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid guid)
    {
        var lastModifiedDate = await Context.TrialOutcomes
            .Where(d => d.TrialOutcomeGuid == guid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }

    public async Task<bool> IsAssociatedOutcomeExistsByDispute(Guid trialDisputeGuid)
    {
        var isAssociatedRecordExists = await Context.TrialOutcomes.AnyAsync(x => x.TrialDisputeGuid == trialDisputeGuid);
        return isAssociatedRecordExists;
    }

    public async Task<bool> IsAssociatedOutcomeExistsByParty(Guid trialParticipantGuid)
    {
        var isAssociatedRecordExists = await Context.TrialOutcomes.AnyAsync(x => x.TrialParticipantGuid == trialParticipantGuid);
        return isAssociatedRecordExists;
    }
}