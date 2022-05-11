using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ScheduleRequest;

public class ScheduleRequestRepository : CmRepository<Model.ScheduleRequest>, IScheduleRequestRepository
{
    public ScheduleRequestRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.ScheduleRequest>> FindByQuery(string queryString, int index, int count)
    {
        var requests = await Context.ScheduleRequests
            .FromSqlRaw(queryString)
            .OrderBy(x => x.RequestStart)
            .ApplyPagingArrayStyle(count, index)
            .ToListAsync();

        return requests;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.ScheduleRequests
            .Where(c => c.ScheduleRequestId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<int> GetQueryResultCount(string queryString)
    {
        var count = await Context.ScheduleRequests.FromSqlRaw(queryString).CountAsync();
        return count;
    }
}