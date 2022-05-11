using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ScheduleRequest;

public interface IScheduleRequestRepository : IRepository<Model.ScheduleRequest>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Model.ScheduleRequest>> FindByQuery(string queryString, int index, int count);

    Task<int> GetQueryResultCount(string queryString);
}