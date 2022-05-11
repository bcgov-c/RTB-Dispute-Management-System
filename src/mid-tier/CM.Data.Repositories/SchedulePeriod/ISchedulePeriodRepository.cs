using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SchedulePeriod;

public interface ISchedulePeriodRepository : IRepository<Model.SchedulePeriod>
{
    Task<Model.SchedulePeriod> GetLastPeriod();

    Task<DateTime?> GetLastModifiedDate(int id);
}