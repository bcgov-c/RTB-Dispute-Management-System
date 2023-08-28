using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Parties;

public class ClaimGroupRepository : CmRepository<ClaimGroup>, IClaimGroupRepository
{
    public ClaimGroupRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<ClaimGroup>> GetDisputeClaimGroups(Guid disputeGuid)
    {
        var claimGroups = await Context.ClaimGroups.Where(c => c.DisputeGuid == disputeGuid).ToListAsync();
        return claimGroups;
    }

    public async Task<List<ClaimGroup>> GetDisputeClaimGroupsWithAllChilds(Guid disputeGuid)
    {
        var claimGroups = await Context
            .ClaimGroups
            .Include(c => c.Claims).ThenInclude(r => r.Remedies).ThenInclude(rd => rd.RemedyDetails)
            .Where(c => c.DisputeGuid == disputeGuid)
            .ToListAsync();
        return claimGroups;
    }

    public async Task<List<ClaimGroup>> GetDisputeClaimGroupsWithParties(Guid disputeGuid)
    {
        var claimGroups = await Context.ClaimGroups.Include(x => x.ClaimGroupParticipants).Where(c => c.DisputeGuid == disputeGuid).ToListAsync();
        return claimGroups;
    }
}