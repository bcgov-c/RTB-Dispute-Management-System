using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.HearingReporting;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Hearings;

public interface IHearingRepository : IRepository<Hearing>
{
    Task<List<Hearing>> GetHearingsByYear(int year, List<byte> priorities);

    Task<List<Hearing>> GetHearingsByMonth(int month, int year, List<byte> priorities);

    Task<List<Hearing>> GetHearingsByDay(DateTime date);

    Task<List<Hearing>> GetHearingByOwner(int hearingOwnerId, DateTime startDate, DateTime endDate);

    Task<List<Hearing>> GetHearingByDate(DateTime date);

    Task<(List<Hearing>, int)> GetAvailableHearings(AvailableHearingsRequest request, int index, int count);

    Task<List<Hearing>> GetFactHearings(List<int> excludedHearings, int dateDelay);

    Task<Hearing> GetLastHearing(Guid disputeGuid);

    Task<Hearing> GetHearingWithParticipationList(int hearingId);

    Task<List<Hearing>> GetHearings(int? userId, DateTime afterDate, int index, int count);

    Task<List<Hearing>> GetActiveHearings(Guid disputeGuid);

    Task<List<AvailableStaffResponse>> GetAvailableStaff(HearingAvailableStaffRequest request, IEnumerable<int> users);

    Task<List<AvailableConferenceBridgesResponse>> GetAvailableHearingsByPeriod(AvailableConferenceBridgesRequest request);

    Task<List<Hearing>> GetHearingsByHearingStartDate(DateTime startDate, DateTime endDate, List<int> disputeHearings);

    Task<DateTime?> GetLastModifiedDate(int hearingId);

    Task<bool> IsHearingExist(int userId, DateTime startDateTime, DateTime endDateTime);

    Task<int> GetHearingsCount(int schedulePeriodId, DateTime periodStart, DateTime periodEnd);

    Task<int> GetAssociatedHearingsCount(DateTime blockStart, DateTime blockEnd, int systemUserId);

    Task<List<Hearing>> GetReserveAvailableHearings(ReserveAvailableHearingsRequest request);

    Task<List<Hearing>> GetHearingByDateAndCreationMethod(DateTime date, DisputeCreationMethod disputeCreationMethod);

    Task<Hearing> GetWithDisputeHearings(int hearingId);

    Task<int> GetAssociatedBookedHearingsCount(DateTime blockStart, DateTime blockEnd, int systemUserId);

    Task<int?> GetHearingWaitTime(ExternalHearingWaitTimeRequest request);

    Task<List<Hearing>> GetOnHoldHearings(OnHoldHearingsRequest request);

    Task<int?> GetWaitTimeDays(byte urgency, int interval, int limit);

    Task<Hearing> GetHearingWithConferenceBridge(int hearingId);
}