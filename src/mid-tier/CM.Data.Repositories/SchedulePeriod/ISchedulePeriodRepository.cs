using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SchedulePeriod;

public interface ISchedulePeriodRepository : IRepository<Model.SchedulePeriod>
{
    Task<Model.SchedulePeriod> GetLastPeriod();

    Task<DateTime?> GetLastModifiedDate(int id);

    Task<(int totalCount, List<Model.SchedulePeriod> periods)> GetPeriods(Expression<Func<Model.SchedulePeriod, bool>> predicate, int count, int index);
}