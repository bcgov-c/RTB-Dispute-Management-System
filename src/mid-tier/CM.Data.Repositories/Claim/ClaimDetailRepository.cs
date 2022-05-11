using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Claim;

public class ClaimDetailRepository : CmRepository<ClaimDetail>, IClaimDetailRepository
{
    public ClaimDetailRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int claimDetailId)
    {
        var dates = await Context.ClaimDetails
            .Where(c => c.ClaimDetailId == claimDetailId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}