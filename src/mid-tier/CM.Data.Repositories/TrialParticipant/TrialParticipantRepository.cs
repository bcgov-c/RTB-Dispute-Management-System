using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.TrialParticipant;

public class TrialParticipantRepository : CmRepository<Model.TrialParticipant>, ITrialParticipantRepository
{
    public TrialParticipantRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.TrialParticipant>> GetByDisputes(Guid disputeGuid)
    {
        var trialParticipants = await Context
            .TrialParticipants
            .Where(x => x.DisputeGuid == disputeGuid).ToListAsync();

        return trialParticipants;
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid guid)
    {
        var lastModifiedDate = await Context.TrialParticipants
            .Where(d => d.TrialParticipantGuid == guid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}