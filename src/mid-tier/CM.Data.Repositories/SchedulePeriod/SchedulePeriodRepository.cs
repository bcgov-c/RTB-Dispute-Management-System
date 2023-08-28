using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Common.Utilities;
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

    public async Task<(int totalCount, List<Model.SchedulePeriod> periods)> GetPeriods(Expression<Func<Model.SchedulePeriod, bool>> predicate, int count, int index)
    {
        var periods = await Context.SchedulePeriods
            .Where(predicate)
            .ToListAsync();

        var pageBlocks = periods.ApplyPagingArrayStyleAsync(count, index);

        return (periods.Count, periods);
    }
}