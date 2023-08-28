using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ScheduleBlock;

public interface IScheduleBlockRepository : IRepository<Model.ScheduleBlock>
{
    Task<int> GetBlocksCount(int schedulePeriodId, DateTime periodStart, DateTime periodEnd);

    Task<DateTime?> GetLastModifiedDate(int id);

    Task<bool> IsOverlapped(int? blockId, int userId, DateTime blockStart, DateTime blockEnd);

    Task<Data.Model.ScheduleBlock> GetBlockWithPeriod(int scheduleBlockId);

    Task<(int totalCount, List<Model.ScheduleBlock> pageBlocks)> GetScheduleBlocks(Expression<Func<Model.ScheduleBlock, bool>> predicate, int count, int index);
}