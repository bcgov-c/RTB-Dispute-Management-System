using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using Polly;

namespace CM.Business.Services.ScheduleBlock;

public class ScheduleBlockService : CmServiceBase, IScheduleBlockService
{
    private const int PeriodRange = 14;

    public ScheduleBlockService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<ScheduleBlockPostResponse> CreateAsync(int schedulePeriodId, ScheduleBlockPostRequest request)
    {
        var scheduleBlock = MapperService.Map<ScheduleBlockPostRequest, Data.Model.ScheduleBlock>(request);
        scheduleBlock.SchedulePeriodId = schedulePeriodId;
        scheduleBlock.IsDeleted = false;
        var scheduleBlockResult = await UnitOfWork.ScheduleBlockRepository.InsertAsync(scheduleBlock);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var block = MapperService.Map<Data.Model.ScheduleBlock, ScheduleBlockPostResponse>(scheduleBlockResult);
            block.AssociatedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedHearingsCount(scheduleBlock.BlockStart, scheduleBlock.BlockEnd, scheduleBlock.SystemUserId);
            return block;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int scheduleBlockId)
    {
        var scheduleBlock = await UnitOfWork.ScheduleBlockRepository.GetByIdAsync(scheduleBlockId);
        if (scheduleBlock != null)
        {
            scheduleBlock.IsDeleted = true;
            UnitOfWork.ScheduleBlockRepository.Attach(scheduleBlock);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ScheduleBlocksGetFullResponse> GetByDateRange(ScheduleBlockGetByDateRangeRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var result = new ScheduleBlocksGetFullResponse();

        var predicate = PredicateBuilder.True<Data.Model.ScheduleBlock>();

        predicate = predicate.And(x => x.BlockStart >= request.BlockStartingAfter
                               && x.BlockStart < request.BlockStartingBefore);

        if (request.SystemUserId.HasValue)
        {
            predicate = predicate.And(x => x.SystemUserId == request.SystemUserId);
        }

        var(totalCount, pageBlocks) = await UnitOfWork
            .ScheduleBlockRepository
            .GetScheduleBlocks(predicate, count, index);

        result.TotalAvailableRecords = totalCount;

        foreach (var item in pageBlocks)
        {
            var blockWithHearing = MapperService.Map<Data.Model.ScheduleBlock, ScheduleBlockGetResponse>(item);
            blockWithHearing.AssociatedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedHearingsCount(item.BlockStart, item.BlockEnd, item.SystemUserId);

            blockWithHearing.AssociatedBookedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedBookedHearingsCount(item.BlockStart, item.BlockEnd, item.SystemUserId);

            result.ScheduleBlocks.Add(blockWithHearing);
        }

        return result;
    }

    public async Task<ScheduleBlockGetResponse> GetByIdAsync(int scheduleBlockId)
    {
        var scheduleBlock = await UnitOfWork.ScheduleBlockRepository.GetByIdAsync(scheduleBlockId);
        if (scheduleBlock != null)
        {
            var result = MapperService.Map<Data.Model.ScheduleBlock, ScheduleBlockGetResponse>(scheduleBlock);
            result.AssociatedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedHearingsCount(scheduleBlock.BlockStart, scheduleBlock.BlockEnd, scheduleBlock.SystemUserId);
            result.AssociatedBookedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedBookedHearingsCount(scheduleBlock.BlockStart, scheduleBlock.BlockEnd, scheduleBlock.SystemUserId);
            return result;
        }

        return null;
    }

    public async Task<ScheduledBlockByPeriodResponse> GetByPeriodId(int schedulePeriodId)
    {
        var response = new ScheduledBlockByPeriodResponse();
        var scheduleBlocks = new List<ScheduleBlockGetResponse>();
        var localDays = new List<LocalDay>();

        var period = await UnitOfWork.SchedulePeriodRepository.GetByIdAsync(schedulePeriodId);
        var start = period.PeriodStart.ToLocalTime();
        var localDate = start;

        var typeUsers = await UnitOfWork.InternalUserRoleRepository.GetAllAsync();
        var type1Users = typeUsers.Where(x => x.EngagementType == EngagementType.FtEmployee).Select(x => x.UserId).ToList();
        var type2Users = typeUsers.Where(x => x.EngagementType == EngagementType.PtEmployee).Select(x => x.UserId).ToList();
        var type3Users = typeUsers.Where(x => x.EngagementType == EngagementType.FtContractor).Select(x => x.UserId).ToList();
        var type4Users = typeUsers.Where(x => x.EngagementType == EngagementType.PtContractor).Select(x => x.UserId).ToList();

        var allRangeBlocks = await UnitOfWork
            .ScheduleBlockRepository
            .FindAllAsync(x => x.BlockStart >= period.PeriodStart && x.BlockStart < period.PeriodEnd);

        while (localDate <= start.AddDays(PeriodRange))
        {
            var localDayOfWeek = localDate.DayOfWeek.ToString();
            var localDay = new LocalDay();
            var totalBlockTypeMins = new TotalBlockTypeMins();
            var engagementTypeBlockType1Mins = new EngagementTypeBlockType1Mins();
            var utcTime = localDate.ToUniversalTime();
            var blocks = allRangeBlocks.Where(x => x.BlockStart.Date == utcTime.Date).ToList();
            if (blocks.Count > 0)
            {
                foreach (var item in blocks)
                {
                    var currentBlock = MapperService.Map<Data.Model.ScheduleBlock, ScheduleBlockGetResponse>(item);
                    currentBlock.AssociatedHearings = await UnitOfWork
                        .HearingRepository
                        .GetAssociatedHearingsCount(item.BlockStart, item.BlockEnd, item.SystemUserId);
                    currentBlock.AssociatedBookedHearings = await UnitOfWork
                        .HearingRepository
                        .GetAssociatedBookedHearingsCount(item.BlockStart, item.BlockEnd, item.SystemUserId);
                    scheduleBlocks.Add(currentBlock);
                }

                totalBlockTypeMins.BlockType1Count = blocks.Count(x => x.BlockType == BlockType.WorkingTime);
                totalBlockTypeMins.BlockType2Count = blocks.Count(x => x.BlockType == BlockType.Duty);

                engagementTypeBlockType1Mins.EngagementType1Count = blocks.Count(x => x.BlockType == BlockType.WorkingTime && type1Users.Contains(x.SystemUserId));
                engagementTypeBlockType1Mins.EngagementType2Count = blocks.Count(x => x.BlockType == BlockType.WorkingTime && type2Users.Contains(x.SystemUserId));
                engagementTypeBlockType1Mins.EngagementType3Count = blocks.Count(x => x.BlockType == BlockType.WorkingTime && type3Users.Contains(x.SystemUserId));
                engagementTypeBlockType1Mins.EngagementType4Count = blocks.Count(x => x.BlockType == BlockType.WorkingTime && type4Users.Contains(x.SystemUserId));

                localDay.DayOfWeek = localDayOfWeek;
                localDay.TotalBlockTypeMins = totalBlockTypeMins;
                localDay.EngagementTypeBlockType1Mins = engagementTypeBlockType1Mins;
                localDays.Add(localDay);
            }

            localDate = localDate.AddDays(1);
        }

        response.PeriodStatistics.Add(new PeriodStatisticsResponse { LocalDays = localDays });
        response.ScheduleBlocks = scheduleBlocks;
        response.SchedulePeriodId = period.SchedulePeriodId;
        response.PeriodStatus = period.PeriodStatus;
        response.PeriodTimeZone = period.PeriodTimeZone;
        response.PeriodStart = period.PeriodStart.ToCmDateTimeString();
        response.PeriodEnd = period.PeriodEnd.ToCmDateTimeString();
        response.LocalPeriodEnd = period.LocalPeriodEnd.ToCmDateTimeString();
        response.LocalPeriodStart = period.LocalPeriodStart.ToCmDateTimeString();
        response.CreatedBy = period.CreatedBy.GetValueOrDefault();
        response.CreatedDate = period.CreatedDate.ToCmDateTimeString();
        response.ModifiedBy = period.ModifiedBy ?? -1;
        response.ModifiedDate = period.ModifiedDate.ToCmDateTimeString() ?? string.Empty;

        return response;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ScheduleBlockRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.ScheduleBlock> GetNoTrackingScheduleBlockAsync(int scheduleBlockId)
    {
        var block = await UnitOfWork.ScheduleBlockRepository.GetBlockWithPeriod(scheduleBlockId);
        return block;
    }

    public async Task<bool> IsBlockOverlapped(int? blockId, int userId, DateTime blockStart, DateTime blockEnd)
    {
        var overlapped = await UnitOfWork.ScheduleBlockRepository.IsOverlapped(blockId, userId, blockStart, blockEnd);
        return overlapped;
    }

    public async Task<ScheduleBlockPatchResponse> PatchAsync(Data.Model.ScheduleBlock originalBlock)
    {
        UnitOfWork.ScheduleBlockRepository.Attach(originalBlock);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var block = MapperService.Map<Data.Model.ScheduleBlock, ScheduleBlockPatchResponse>(originalBlock);
            block.AssociatedHearings = await UnitOfWork
                .HearingRepository
                .GetAssociatedHearingsCount(originalBlock.BlockStart, originalBlock.BlockEnd, originalBlock.SystemUserId);
            return block;
        }

        return null;
    }
}