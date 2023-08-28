using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ScheduleBlock;

namespace CM.Business.Services.ScheduleBlock;

public interface IScheduleBlockService : IServiceBase
{
    Task<ScheduleBlockPostResponse> CreateAsync(int schedulePeriodId, ScheduleBlockPostRequest request);

    Task<bool> IsBlockOverlapped(int? blockId, int userId, DateTime blockStart, DateTime blockEnd);

    Task<Data.Model.ScheduleBlock> GetNoTrackingScheduleBlockAsync(int scheduleBlockId);

    Task<ScheduleBlockPatchResponse> PatchAsync(Data.Model.ScheduleBlock originalBlock);

    Task<bool> DeleteAsync(int scheduleBlockId);

    Task<ScheduleBlockGetResponse> GetByIdAsync(int scheduleBlockId);

    Task<ScheduledBlockByPeriodResponse> GetByPeriodId(int schedulePeriodId);

    Task<ScheduleBlocksGetFullResponse> GetByDateRange(ScheduleBlockGetByDateRangeRequest request, int count, int index);
}