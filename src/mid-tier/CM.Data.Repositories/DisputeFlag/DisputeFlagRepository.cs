using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeFlag;

public class DisputeFlagRepository : CmRepository<Model.DisputeFlag>, IDisputeFlagRepository
{
    public DisputeFlagRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.DisputeFlag>> GetByDisputeGuid(Guid disputeGuid)
    {
        var disputeFlagList = await Context.DisputeFlags.Include(x => x.Dispute)
            .Where(d => d.DisputeGuid == disputeGuid)
            .ToListAsync();

        return disputeFlagList;
    }

    public async Task<List<Model.DisputeFlag>> GetFlagsByGuidList(List<Guid?> guidList)
    {
        var flags = await Context
            .DisputeFlags
            .Include(x => x.Dispute)
            .Where(x => guidList.Contains(x.DisputeGuid))
            .ToListAsync();

        return flags;
    }

    public async Task<Model.DisputeFlag> GetFlagWithDispute(int disputeFlagId)
    {
        var disputeFlag = await Context
            .DisputeFlags
            .Include(x => x.Dispute)
            .FirstOrDefaultAsync(x => x.DisputeFlagId == disputeFlagId);

        return disputeFlag;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var lastModifiedDate = await Context.DisputeFlags
            .Where(d => d.DisputeFlagId == id)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}