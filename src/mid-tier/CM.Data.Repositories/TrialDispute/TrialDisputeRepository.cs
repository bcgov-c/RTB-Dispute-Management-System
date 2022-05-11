using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.TrialDispute;

public class TrialDisputeRepository : CmRepository<Model.TrialDispute>, ITrialDisputeRepository
{
    public TrialDisputeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.TrialDispute>> GetByDisputeGuid(Guid disputeGuid)
    {
        var trialDisputes = await Context.TrialDisputes.Where(x => x.DisputeGuid == disputeGuid).ToListAsync();
        return trialDisputes;
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid guid)
    {
        var lastModifiedDate = await Context.TrialDisputes
            .Where(d => d.TrialDisputeGuid == guid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}