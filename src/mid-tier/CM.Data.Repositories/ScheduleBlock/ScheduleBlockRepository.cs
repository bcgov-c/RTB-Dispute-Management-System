using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ScheduleBlock;

public class ScheduleBlockRepository : CmRepository<Model.ScheduleBlock>, IScheduleBlockRepository
{
    public ScheduleBlockRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<int> GetBlocksCount(int schedulePeriodId, DateTime periodStart, DateTime periodEnd)
    {
        var count = await Context.ScheduleBlocks.CountAsync(x => x.SchedulePeriodId == schedulePeriodId
                                                                 && x.BlockStart >= periodStart && x.BlockStart <= periodEnd);

        return count;
    }

    public async Task<Model.ScheduleBlock> GetBlockWithPeriod(int scheduleBlockId)
    {
        var block = await Context
            .ScheduleBlocks
            .Include(x => x.SchedulePeriod)
            .SingleOrDefaultAsync(x => x.ScheduleBlockId == scheduleBlockId);

        return block;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.ScheduleBlocks
            .Where(c => c.ScheduleBlockId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> IsOverlapped(int? blockId, int userId, DateTime blockStart, DateTime blockEnd)
    {
        bool isOverlapped;

        if (blockId.HasValue)
        {
            isOverlapped = await Context
                .ScheduleBlocks
                .AnyAsync(x => x.SystemUserId == userId && x.ScheduleBlockId != blockId.Value
                                                        && ((x.BlockStart <= blockStart && x.BlockEnd > blockStart) || (x.BlockStart > blockStart && x.BlockStart < blockEnd)));
        }
        else
        {
            isOverlapped = await Context
                .ScheduleBlocks
                .AnyAsync(x => x.SystemUserId == userId
                               && ((x.BlockStart <= blockStart && x.BlockEnd > blockStart) || (x.BlockStart > blockStart && x.BlockStart < blockEnd)));
        }

        return isOverlapped;
    }
}