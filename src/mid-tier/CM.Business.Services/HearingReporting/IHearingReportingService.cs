using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingReporting;

namespace CM.Business.Services.HearingReporting;

public interface IHearingReportingService
{
    Task<Year> GetYearlyHearings(int year, HearingReportingRequest request);

    Task<MonthlyReport> GetMonthlyHearings(int month, int year, HearingReportingRequest request);

    Task<DayReport> GetDailyHearingDetails(DateTime date);

    Task<OwnerHearingsResponse> GetOwnerHearings(int hearingOwnerId, OwnerHearingsDetailRequest request);

    Task<AvailableHearingsResponse> GetAvailableHearings(AvailableHearingsRequest request, int index, int count);
}