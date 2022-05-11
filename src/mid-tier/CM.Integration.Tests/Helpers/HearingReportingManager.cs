using System;
using System.Net.Http;
using CM.Business.Entities.Models.HearingReporting;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class HearingReportingManager
{
    public static EntityWithStatus<Year> GetYearlyHearings(HttpClient client, int year, HearingReportingRequest request)
    {
        return client.GetAsync<Year>(RouteHelper.GetYearlyHearings + year, request);
    }

    public static EntityWithStatus<MonthlyReport> GetMonthlyHearings(HttpClient client, int month, int year, HearingReportingRequest request)
    {
        return client.GetAsync<MonthlyReport>(RouteHelper.GetMonthlyHearings + month + "/" + year, request);
    }

    public static EntityWithStatus<MonthlyReport> GetDailyHearings(HttpClient client, DateTime dateTime, HearingReportingRequest request)
    {
        return client.GetAsync<MonthlyReport>(RouteHelper.GetDailyHearings + dateTime.ToLongTimeString(), request);
    }
}