using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Remedy;

public class RemedyDetailRepository : CmRepository<RemedyDetail>, IRemedyDetailRepository
{
    public RemedyDetailRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int remedyDetailId)
    {
        var dates = await Context.RemedyDetails
            .Where(c => c.RemedyDetailId == remedyDetailId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<RemedyDetail>> GetByRemedyId(int remedyId)
    {
        var remedyDetails = await Context.RemedyDetails
            .Where(r => r.RemedyId == remedyId)
            .ToListAsync();

        return remedyDetails;
    }
}