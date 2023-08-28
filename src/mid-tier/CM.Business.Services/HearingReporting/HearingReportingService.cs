using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.HearingReporting;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.HearingReporting;

public class HearingReportingService : CmServiceBase, IHearingReportingService
{
    public HearingReportingService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Year> GetYearlyHearings(int year, HearingReportingRequest request)
    {
        var yearlyHearings = await UnitOfWork.HearingRepository.GetHearingsByYear(year, request.Priorities);
        var yearlyReport = await CollectYearlyHearingData(yearlyHearings, year, request);

        yearlyReport.Months = new List<Month>();
        foreach (var month in Enum.GetValues(typeof(Months)))
        {
            var monthlyHearings = await yearlyHearings
                .Where(h =>
                {
                    Debug.Assert(h.LocalStartDateTime != null, "h.LocalStartDateTime != null");
                    return h.LocalStartDateTime.Value.Month == (int)month;
                })
                .ToListAsync();

            var monthlyReport = await CollectMonthlyHearingDataForYearReport(monthlyHearings, (int)month, year, request);
            yearlyReport.Months.Add(monthlyReport);
        }

        return yearlyReport;
    }

    public async Task<MonthlyReport> GetMonthlyHearings(int month, int year, HearingReportingRequest request)
    {
        var monthlyHearings = await UnitOfWork.HearingRepository.GetHearingsByMonth(month, year, request.Priorities);

        var(assignedHearings, unAssignedHearings) = SplitHearings(monthlyHearings);

        var monthlyReport = await CollectMonthlyHearingData(monthlyHearings, month, year, request);

        monthlyReport.Days = new List<Day>();
        var lastDay = DateTime.DaysInMonth(year, month);
        var monthDays = new int[lastDay];
        var dayOfMonth = 0;
        for (var i = 0; i < monthDays.Length; i++)
        {
            dayOfMonth++;

            var ofMonth = dayOfMonth;
            var dailyHearings = await monthlyHearings
                .Where(h =>
                {
                    Debug.Assert(h.LocalStartDateTime != null, "h.LocalStartDateTime != null");
                    return h.LocalStartDateTime.Value.Day == ofMonth;
                })
                .ToListAsync();

            var dailyReport = await CollectDailyHearingData(dailyHearings, dayOfMonth, month, year, request);
            monthlyReport.Days.Add(dailyReport);
        }

        return monthlyReport;
    }

    public async Task<DayReport> GetDailyHearingDetails(DateTime date)
    {
        var dailyHearings = await UnitOfWork.HearingRepository.GetHearingsByDay(date);

        var(assignedHearings, unAssignedHearings) = SplitHearings(dailyHearings);

        var dailyReport = new DayReport
        {
            Date = date.ToString("yyyy-MM-dd"),
            DayTotalHearings = dailyHearings.Count,
            DayAssignedHearings = assignedHearings.Count,
            DayUnassignedHearings = unAssignedHearings.Count
        };

        var sb = await UnitOfWork
            .ScheduleBlockRepository
            .FindAllAsync(x => x.BlockStart.Date == date || x.BlockEnd.Date == date);
        dailyReport.ScheduleBlocks = MapperService.Map<ICollection<Data.Model.ScheduleBlock>, ICollection<ScheduleBlockPostResponse>>(sb).ToList();

        var ownerHearings = await CollectDailyHearingReportData(dailyHearings);
        dailyReport.OwnerHearings = new List<OwnerHearing>();
        dailyReport.OwnerHearings.AddRange(ownerHearings);
        return dailyReport;
    }

    public async Task<OwnerHearingsResponse> GetOwnerHearings(int hearingOwnerId, OwnerHearingsDetailRequest request)
    {
        var response = new OwnerHearingsResponse();
        var dailyHearings = new List<DailyHearingResponse>();
        var ownerHearings = await UnitOfWork.HearingRepository.GetHearingByOwner(hearingOwnerId, request.StartDate, request.EndDate);

        var ownerInfo = await UnitOfWork.SystemUserRepository.GetByIdAsync(hearingOwnerId);

        var(assignedHearings, unAssignedHearings) = SplitHearings(ownerHearings);
        var totalAssignedCount = assignedHearings.Count;
        var totalUnassignedCount = unAssignedHearings.Count;

        response.UserId = hearingOwnerId;
        response.FullName = ownerInfo.FullName;
        response.TotalAssigned = totalAssignedCount;
        response.TotalUnassigned = totalUnassignedCount;

        var groupedHearings = ownerHearings.GroupBy(x =>
        {
            Debug.Assert(x.LocalStartDateTime != null, "x.LocalStartDateTime != null");
            return x.LocalStartDateTime.Value.Date;
        }).ToDictionary(x => x.Key);

        foreach (var hearingDay in groupedHearings.Keys)
        {
            var hearings = new List<HearingReport>();

            var dayHearings = ownerHearings.Where(h =>
            {
                Debug.Assert(h.LocalStartDateTime != null, "h.LocalStartDateTime != null");
                return h.LocalStartDateTime.Value.Date == hearingDay.Date;
            }).ToList();
            foreach (var dayHearing in dayHearings)
            {
                var hearingDisputes = await UnitOfWork.DisputeHearingRepository.GetHearingDisputes(dayHearing.HearingId);

                var hearing = MapperService.Map<HearingReport>(dayHearing);
                if (hearing.HearingReservedDisputeGuid.HasValue)
                {
                    hearing.HearingReservedFileNumber = await UnitOfWork
                        .DisputeRepository.GetFileNumber(hearing.HearingReservedDisputeGuid.Value);
                }

                hearing.Disputes = MapperService.Map<List<HearingReportDispute>>(hearingDisputes);
                hearings.Add(hearing);
            }

            var dailyHearing = new DailyHearingResponse
            {
                Date = hearingDay.ToString("yyyy-MM-dd"),
                Hearings = hearings
            };

            dailyHearings.Add(dailyHearing);
        }

        response.DailyHearings = dailyHearings;

        var sb = await UnitOfWork
            .ScheduleBlockRepository
            .FindAllAsync(x => x.BlockStart <= request.EndDate
                               && x.BlockEnd >= request.StartDate
                               && x.SystemUserId == hearingOwnerId);
        response.ScheduleBlocks = MapperService.Map<ICollection<Data.Model.ScheduleBlock>, ICollection<ScheduleBlockPostResponse>>(sb).ToList();

        return response;
    }

    public async Task<AvailableHearingsResponse> GetAvailableHearings(AvailableHearingsRequest request, int index, int count)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var response = new AvailableHearingsResponse();

        var(availableHearings, availableHearingsCount) = await UnitOfWork.HearingRepository.GetAvailableHearings(request, index, count);

        response.AvailableHearings = MapperService.Map<List<Hearing>, List<AvailableHearing>>(availableHearings);
        response.TotalAvailableRecords = availableHearingsCount;

        return response;
    }

    private async Task<Year> CollectYearlyHearingData(
        IReadOnlyCollection<Hearing> yearlyHearings,
        int year,
        HearingReportingRequest request)
    {
        var(assignedHs, unAssignedHs) = SplitHearings(yearlyHearings);
        var yearlyReport = new Year
        {
            HearingYear = year,
            YearTotalHearings = yearlyHearings.Count,
            YearAssignedHearings = assignedHs.Count,
            YearUnassignedHearings = unAssignedHs.Count,
            YearDetails = new List<YearDetail>()
        };

        foreach (var priority in request.Priorities)
        {
            var hearings = await yearlyHearings.Where(h => h.HearingPriority == priority).ToListAsync();
            var assignedHearings = await assignedHs.Where(h => h.HearingPriority == priority).ToListAsync();
            var unassignedHearings = await unAssignedHs.Where(h => h.HearingPriority == priority).ToListAsync();
            var hearingDetails = new YearDetail
            {
                HearingPriority = priority,
                TotalHearingCount = hearings.Count,
                AssignedHearingCount = assignedHearings.Count,
                UnassignedHearingCount = unassignedHearings.Count
            };

            yearlyReport.YearDetails.Add(hearingDetails);
        }

        return yearlyReport;
    }

    private async Task<Month> CollectMonthlyHearingDataForYearReport(
        IReadOnlyCollection<Hearing> monthlyHearings,
        int month,
        int year,
        HearingReportingRequest request)
    {
        var(assignedHs, unAssignedHs) = SplitHearings(monthlyHearings);
        var assignedHearingIds = await assignedHs.Select(h => h.HearingId).ToListAsync();
        await unAssignedHs.Select(h => h.HearingId).ToListAsync();

        var monthlyAssignedHearings = new List<Hearing>();
        var monthlyUnassignedHearings = new List<Hearing>();

        foreach (var monthlyHearing in monthlyHearings)
        {
            if (assignedHearingIds.Contains(monthlyHearing.HearingId))
            {
                monthlyAssignedHearings.Add(monthlyHearing);
            }
            else
            {
                monthlyUnassignedHearings.Add(monthlyHearing);
            }
        }

        var monthlyReport = new Month
        {
            HearingMonth = $"{month}-{year}",
            MonthTotalHearings = monthlyHearings.Count,
            MonthAssignedHearings = monthlyAssignedHearings.Count,
            MonthUnassignedHearings = monthlyUnassignedHearings.Count,
            MonthDetails = new List<MonthDetail>()
        };

        foreach (var priority in request.Priorities)
        {
            var hearings = monthlyHearings.Where(h => h.HearingPriority == priority);
            var assignedHearings = monthlyAssignedHearings.Where(h => h.HearingPriority == priority);
            var unassignedHearings = monthlyUnassignedHearings.Where(h => h.HearingPriority == priority);
            var hearingDetails = new MonthDetail
            {
                HearingPriority = priority,
                TotalHearingCount = hearings.Count(),
                AssignedHearingCount = assignedHearings.Count(),
                UnassignedHearingCount = unassignedHearings.Count()
            };

            monthlyReport.MonthDetails.Add(hearingDetails);
        }

        return monthlyReport;
    }

    private async Task<MonthlyReport> CollectMonthlyHearingData(
        IReadOnlyCollection<Hearing> monthlyHearings,
        int month,
        int year,
        HearingReportingRequest request)
    {
        var(assignedHs, unAssignedHs) = SplitHearings(monthlyHearings);
        var assignedHearingIds = await assignedHs.Select(h => h.HearingId).ToListAsync();
        await unAssignedHs.Select(h => h.HearingId).ToListAsync();

        var monthlyAssignedHearings = new List<Hearing>();
        var monthlyUnassignedHearings = new List<Hearing>();

        foreach (var monthlyHearing in monthlyHearings)
        {
            if (assignedHearingIds.Contains(monthlyHearing.HearingId))
            {
                monthlyAssignedHearings.Add(monthlyHearing);
            }
            else
            {
                monthlyUnassignedHearings.Add(monthlyHearing);
            }
        }

        var monthlyReport = new MonthlyReport
        {
            HearingMonth = new DateTime(year, month, 1).ToString("yyyy-MM"),
            MonthTotalHearings = monthlyHearings.Count,
            MonthAssignedHearings = monthlyAssignedHearings.Count,
            MonthUnassignedHearings = monthlyUnassignedHearings.Count,
            MonthDetails = new List<MonthDetail>()
        };

        foreach (var priority in request.Priorities)
        {
            var hearings = monthlyHearings.Where(h => h.HearingPriority == priority);
            var assignedHearings = monthlyAssignedHearings.Where(h => h.HearingPriority == priority);
            var unassignedHearings = monthlyUnassignedHearings.Where(h => h.HearingPriority == priority);
            var hearingDetails = new MonthDetail
            {
                HearingPriority = priority,
                TotalHearingCount = hearings.Count(),
                AssignedHearingCount = assignedHearings.Count(),
                UnassignedHearingCount = unassignedHearings.Count()
            };

            monthlyReport.MonthDetails.Add(hearingDetails);
        }

        return monthlyReport;
    }

    private async Task<Day> CollectDailyHearingData(IReadOnlyCollection<Hearing> dailyHearings, int day, int month, int year, HearingReportingRequest request)
    {
        var(assignedHs, unAssignedHs) = SplitHearings(dailyHearings);
        var assignedHearingIds = await assignedHs.Select(h => h.HearingId).ToListAsync();
        await unAssignedHs.Select(h => h.HearingId).ToListAsync();

        var dailyAssignedHearings = new List<Hearing>();
        var dailyUnassignedHearings = new List<Hearing>();

        foreach (var dailyHearing in dailyHearings)
        {
            if (assignedHearingIds.Contains(dailyHearing.HearingId))
            {
                dailyAssignedHearings.Add(dailyHearing);
            }
            else
            {
                dailyUnassignedHearings.Add(dailyHearing);
            }
        }

        var dailyReport = new Day
        {
            Date = new DateTime(year, month, day).ToString("yyyy-MM-dd"),
            DayTotalHearings = dailyHearings.Count,
            DayAssignedHearings = dailyAssignedHearings.Count,
            DayUnassignedHearings = dailyUnassignedHearings.Count,
            DayDetails = new List<DayDetail>()
        };

        foreach (var priority in request.Priorities)
        {
            var hearings = dailyHearings.Where(h => h.HearingPriority == priority);
            var assignedHearings = dailyAssignedHearings.Where(h => h.HearingPriority == priority);
            var unassignedHearings = dailyUnassignedHearings.Where(h => h.HearingPriority == priority);
            var hearingDetails = new DayDetail
            {
                HearingPriority = priority,
                TotalHearingCount = hearings.Count(),
                AssignedHearingCount = assignedHearings.Count(),
                UnassignedHearingCount = unassignedHearings.Count()
            };

            dailyReport.DayDetails.Add(hearingDetails);
        }

        return dailyReport;
    }

    private async Task<List<OwnerHearing>> CollectDailyHearingReportData(IEnumerable<Hearing> dailyHearings)
    {
        var ownerHearings = new List<OwnerHearing>();
        var groupedHearings = dailyHearings.GroupBy(h => h.HearingOwner).ToList();
        foreach (var groupedHearing in groupedHearings)
        {
            if (groupedHearing.Key != null)
            {
                var hearings = MapperService.Map<List<Hearing>, List<HearingReport>>(groupedHearing.ToList());

                foreach (var hearing in hearings)
                {
                    if (hearing.HearingReservedDisputeGuid.HasValue)
                    {
                        hearing.HearingReservedFileNumber = await UnitOfWork
                            .DisputeRepository
                            .GetFileNumber(hearing.HearingReservedDisputeGuid.Value);
                    }
                }

                var ownerHearing = new OwnerHearing
                {
                    UserId = (int)groupedHearing.Key,
                    FullName = groupedHearing.FirstOrDefault()?.SystemUser.FullName,
                    Hearings = hearings
                };

                foreach (var ownerHearingHearing in ownerHearing.Hearings)
                {
                    var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetHearingDisputes(ownerHearingHearing.HearingId);
                    ownerHearingHearing.Disputes = new List<HearingReportDispute>();
                    var disputeHearingsReport =
                        MapperService.Map<List<Data.Model.DisputeHearing>, List<HearingReportDispute>>(disputeHearings);
                    ownerHearingHearing.Disputes.AddRange(disputeHearingsReport);
                }

                ownerHearings.Add(ownerHearing);
            }
        }

        var orderedOwnerHearings = ownerHearings.OrderBy(h => h.FullName).ToList();
        return orderedOwnerHearings;
    }

    private(List<Hearing> assignedHearings, List<Hearing> unAssignedHearings) SplitHearings(IEnumerable<Hearing> hearings)
    {
        var assignedHearings = new List<Hearing>();
        var unAssignedHearings = new List<Hearing>();

        foreach (var hearing in hearings)
        {
            if (hearing.DisputeHearings is { Count: > 0 })
            {
                assignedHearings.Add(hearing);
            }
            else
            {
                unAssignedHearings.Add(hearing);
            }
        }

        return (assignedHearings, unAssignedHearings);
    }
}