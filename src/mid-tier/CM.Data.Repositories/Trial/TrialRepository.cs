using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Trial;

public class TrialRepository : CmRepository<Model.Trial>, ITrialRepository
{
    public TrialRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid guid)
    {
        var lastModifiedDate = await Context.Trials
            .Where(d => d.TrialGuid == guid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}