using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.SchedulePeriod;

public class SchedulePeriodRepository : CmRepository<Model.SchedulePeriod>, ISchedulePeriodRepository
{
    public SchedulePeriodRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.SchedulePeriods
            .Where(c => c.SchedulePeriodId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<Model.SchedulePeriod> GetLastPeriod()
    {
        var any = await Context.SchedulePeriods.AnyAsync();

        if (any)
        {
            var period = await Context.SchedulePeriods.OrderBy(x => x.SchedulePeriodId).LastOrDefaultAsync();

            return period;
        }

        return null;
    }
}