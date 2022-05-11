﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.SchedulePeriod;

public class SchedulePeriodService : CmServiceBase, ISchedulePeriodService
{
    private const int PeriodRange = 14;

    public SchedulePeriodService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<SchedulePeriodPostResponse> CreateAsync(SchedulePeriodPostRequest request)
    {
        var lastPeriod = await UnitOfWork.SchedulePeriodRepository.GetLastPeriod();

        var newSchedulePeriod = new Data.Model.SchedulePeriod
        {
            PeriodTimeZone = request.PeriodTimeZone,
            PeriodStatus = PeriodStatus.Inactive,
            IsDeleted = false
        };

        if (lastPeriod == null)
        {
            newSchedulePeriod.LocalPeriodStart = DateTime.Now.StartOfWeek(DayOfWeek.Sunday);
            newSchedulePeriod.LocalPeriodEnd = newSchedulePeriod.LocalPeriodStart.AddDays(PeriodRange);

            TimeZoneInfo.ClearCachedData();
            var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");

            newSchedulePeriod.PeriodStart = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(newSchedulePeriod.LocalPeriodStart, DateTimeKind.Unspecified), timezone);
            newSchedulePeriod.PeriodEnd = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(newSchedulePeriod.LocalPeriodEnd, DateTimeKind.Unspecified), timezone);
        }
        else
        {
            newSchedulePeriod.LocalPeriodStart = lastPeriod.PeriodStart.Date.AddDays(PeriodRange);
            newSchedulePeriod.LocalPeriodEnd = newSchedulePeriod.LocalPeriodStart.AddDays(PeriodRange);

            TimeZoneInfo.ClearCachedData();
            var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");

            newSchedulePeriod.PeriodStart = TimeZoneInfo.ConvertTimeToUtc(newSchedulePeriod.LocalPeriodStart, timezone);
            newSchedulePeriod.PeriodEnd = TimeZoneInfo.ConvertTimeToUtc(newSchedulePeriod.LocalPeriodEnd, timezone);
        }

        var schedulePeriodResult = await UnitOfWork.SchedulePeriodRepository.InsertAsync(newSchedulePeriod);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.SchedulePeriod, SchedulePeriodPostResponse>(schedulePeriodResult);
        }

        return null;
    }

    public async Task<SchedulePeriodGetFilterResponse> Get(SchedulePeriodGetRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var result = new SchedulePeriodGetFilterResponse();

        var periods = await UnitOfWork.SchedulePeriodRepository.GetAllAsync();

        if (request.BetweenSchedulePeriodId is { Length: > 1 })
        {
            periods = periods.Where(x => x.SchedulePeriodId >= request.BetweenSchedulePeriodId[0] && x.SchedulePeriodId <= request.BetweenSchedulePeriodId[1]).ToList();
        }

        if (request.AfterPeriodEndingDate.HasValue)
        {
            periods = periods.Where(x => x.PeriodEnd >= request.AfterPeriodEndingDate.Value).ToList();
        }

        if (request.BeforePeriodEndingDate.HasValue)
        {
            periods = periods.Where(x => x.PeriodEnd <= request.BeforePeriodEndingDate.Value).ToList();
        }

        if (request.InPeriodTimeZone.HasValue)
        {
            periods = periods.Where(x => x.PeriodTimeZone == request.InPeriodTimeZone.Value).ToList();
        }

        if (request.ContainsPeriodStatuses is { Length: > 0 })
        {
            periods = periods.Where(x => request.ContainsPeriodStatuses.Contains((int)x.PeriodStatus)).ToList();
        }

        result.TotalAvailableRecords = periods.Count;
        periods = await periods.ApplyPagingArrayStyleAsync(count, index);
        var periodsResult = new List<SchedulePeriodGetResponse>();

        foreach (var period in periods)
        {
            var associatedBlocksCount = await UnitOfWork.ScheduleBlockRepository.GetBlocksCount(period.SchedulePeriodId, period.PeriodStart, period.PeriodEnd);
            var associatedHearingsCount = await UnitOfWork.HearingRepository.GetHearingsCount(period.SchedulePeriodId, period.PeriodStart, period.PeriodEnd);

            var temp = MapperService.Map<Data.Model.SchedulePeriod, SchedulePeriodGetResponse>(period);
            temp.AssociatedScheduleBlocks = associatedBlocksCount;
            temp.AssociatedHearings = associatedHearingsCount;

            periodsResult.Add(temp);
        }

        result.Periods = periodsResult;

        return result;
    }

    public async Task<SchedulePeriodGetResponse> GetByIdAsync(int schedulePeriodId)
    {
        var period = await UnitOfWork.SchedulePeriodRepository.GetByIdAsync(schedulePeriodId);
        if (period != null)
        {
            var associatedBlocksCount = await UnitOfWork.ScheduleBlockRepository.GetBlocksCount(period.SchedulePeriodId, period.PeriodStart, period.PeriodEnd);
            var associatedHearingsCount = await UnitOfWork.HearingRepository.GetHearingsCount(period.SchedulePeriodId, period.PeriodStart, period.PeriodEnd);

            var periodResult = MapperService.Map<Data.Model.SchedulePeriod, SchedulePeriodGetResponse>(period);
            periodResult.AssociatedScheduleBlocks = associatedBlocksCount;
            periodResult.AssociatedHearings = associatedHearingsCount;

            return periodResult;
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.SchedulePeriodRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.SchedulePeriod> GetNoTrackingSchedulePeriodAsync(int schedulePeriodId)
    {
        var period = await UnitOfWork.SchedulePeriodRepository.GetNoTrackingByIdAsync(
            r => r.SchedulePeriodId == schedulePeriodId);
        return period;
    }

    public async Task<Data.Model.SchedulePeriod> GetSchedulePeriod(int schedulePeriodId)
    {
        var period = await UnitOfWork.SchedulePeriodRepository.GetNoTrackingByIdAsync(
            r => r.SchedulePeriodId == schedulePeriodId);
        return period;
    }

    public async Task<Data.Model.SchedulePeriod> PatchAsync(Data.Model.SchedulePeriod originalPeriod)
    {
        UnitOfWork.SchedulePeriodRepository.Attach(originalPeriod);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return originalPeriod;
        }

        return null;
    }
}