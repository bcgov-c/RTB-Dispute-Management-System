using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Amendment;

public class AmendmentRepository : CmRepository<Model.Amendment>, IAmendmentRepository
{
    public AmendmentRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int amendmentId)
    {
        var dates = await Context.Amendments
            .Where(c => c.AmendmentId == amendmentId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}