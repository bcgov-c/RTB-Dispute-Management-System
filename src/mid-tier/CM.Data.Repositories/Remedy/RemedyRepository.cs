using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Remedy;

public class RemedyRepository : CmRepository<Model.Remedy>, IRemedyRepository
{
    public RemedyRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int remedyId)
    {
        var dates = await Context.Remedies
            .Where(c => c.RemedyId == remedyId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<Model.Remedy> GetRemedyById(int remedyId)
    {
        var remedy = await Context.Remedies.SingleOrDefaultAsync(r => r.RemedyId == remedyId);
        return remedy;
    }

    public async Task<Model.Remedy> GetRemedyWithChildsAsync(int remedyId)
    {
        var remedy = await Context
            .Remedies
            .Include(x => x.Claim)
            .ThenInclude(x => x.ClaimGroup)
            .SingleOrDefaultAsync(x => x.RemedyId == remedyId);

        return remedy;
    }
}