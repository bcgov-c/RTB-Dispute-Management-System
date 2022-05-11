using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.HearingReporting;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Hearings;

public class HearingRepository : CmRepository<Hearing>, IHearingRepository
{
    public HearingRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Hearing>> GetHearingsByYear(int year, List<byte> priorities)
    {
        var hearings = await Context.Hearings
            .Where(h => h.LocalStartDateTime.Value.Year <= year && h.LocalEndDateTime.Value.Year >= year &&
                        priorities.Contains((byte)h.HearingPriority))
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetHearingsByMonth(int month, int year, List<byte> priorities)
    {
        var hearings = await Context.Hearings
            .Where(h => h.LocalStartDateTime.Value.Year <= year && h.LocalEndDateTime.Value.Year >= year &&
                        h.LocalStartDateTime.Value.Month <= month && h.LocalEndDateTime.Value.Month >= month &&
                        priorities.Contains((byte)h.HearingPriority))
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetHearingsByDay(DateTime date)
    {
        var hearings = await Context.Hearings
            .Include(h => h.SystemUser)
            .Where(h => h.LocalStartDateTime.Value.Date.DayOfYear == date.DayOfYear &&
                        h.LocalStartDateTime.Value.Year == date.Year)
            .Include(h => h.ConferenceBridge)
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetHearingByOwner(int hearingOwnerId, DateTime startDate, DateTime? endDate)
    {
        if (endDate.HasValue)
        {
            var hearingsWithEnd = await Context.Hearings
                .Where(h => h.HearingOwner == hearingOwnerId && h.LocalStartDateTime.Value >= startDate &&
                            h.LocalStartDateTime.Value <= endDate.Value).OrderBy(h => h.LocalStartDateTime.Value)
                .Include(h => h.ConferenceBridge)
                .ToListAsync();

            return hearingsWithEnd;
        }

        var hearings = await Context.Hearings
            .Where(h => h.HearingOwner == hearingOwnerId && h.LocalStartDateTime.Value >= startDate)
            .OrderBy(h => h.LocalStartDateTime.Value)
            .Include(h => h.ConferenceBridge)
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetHearingByDate(DateTime date)
    {
        var hearings = await Context.Hearings
            .Include(h => h.DisputeHearings).ThenInclude(h => h.Dispute)
            .Where(h => h.LocalStartDateTime.Value.Date == date)
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetHearingByDateAndCreationMethod(DateTime date, DisputeCreationMethod disputeCreationMethod)
    {
        var creationMethod = (byte?)disputeCreationMethod;
        var hearings = await Context.Hearings
            .Include(h => h.DisputeHearings)
            .ThenInclude(dh => dh.Dispute)
            .Where(h => h.LocalStartDateTime.Value.Date == date && h.DisputeHearings.Any(x => x.Dispute.CreationMethod == creationMethod))
            .ToListAsync();

        return hearings;
    }

    public async Task<(List<Hearing>, int)> GetAvailableHearings(AvailableHearingsRequest request, int index, int count)
    {
        var result = await Context.Hearings
            .Include(x => x.DisputeHearings)
            .Where(x => x.LocalStartDateTime >= request.MinStartDate && x.DisputeHearings.Count == 0 &&
                        (x.HearingReservedUntil <= DateTime.UtcNow || !x.HearingReservedUntil.HasValue))
            .ToListAsync();

        if (request.MaxStartDate.HasValue)
        {
            result = await result.Where(x => x.LocalStartDateTime <= request.MaxStartDate.Value).ToListAsync();
        }

        if (request.IncludedPriorities != null && request.IncludedPriorities.Any())
        {
            result = await result.Where(x => x.HearingPriority != null && request.IncludedPriorities.Contains((int)x.HearingPriority))
                .ToListAsync();
        }

        if (request.IncludedOwnerId.HasValue)
        {
            result = await result.Where(x => x.HearingOwner == request.IncludedOwnerId.Value).ToListAsync();
        }

        if (request.IncludedOwnerRoleSubtypeId != null && request.IncludedOwnerRoleSubtypeId.Any())
        {
            var internalUsers = await Context
                .InternalUserRoles
                .Where(x => request.IncludedOwnerRoleSubtypeId.Contains((int)x.RoleSubtypeId))
                .Select(x => x.UserId)
                .ToListAsync();

            result = await result
                .Where(x => x.HearingOwner.HasValue && internalUsers.Contains(x.HearingOwner.Value))
                .ToListAsync();
        }

        var totalCount = result.Count;
        result = await result.OrderBy(x => x.HearingStartDateTime).Skip(index).Take(count).ToListAsync();

        return (result, totalCount);
    }

    public async Task<Hearing> GetLastHearing(Guid disputeGuid)
    {
        var disputeHearings = await Context.DisputeHearings
            .Where(x => x.DisputeGuid == disputeGuid)
            .Include(x => x.Hearing)
            .OrderBy(d => d.DisputeHearingId)
            .LastOrDefaultAsync();

        return disputeHearings?.Hearing;
    }

    public async Task<Hearing> GetHearingWithParticipationList(int hearingId)
    {
        var hearing = await Context.Hearings
            .Include(x => x.HearingParticipations)
            .SingleOrDefaultAsync(x => x.HearingId == hearingId);

        return hearing;
    }

    public async Task<List<AvailableStaffResponse>> GetAvailableStaff(HearingAvailableStaffRequest request, IEnumerable<int> users)
    {
        var hearingOwners = await Context.Hearings
            .Where(x => (x.LocalEndDateTime > request.LocalStartDatetime
                         && x.LocalStartDateTime < request.LocalEndDatetime)
                        && x.HearingOwner != null)
            .Select(x => x.HearingOwner.Value)
            .Distinct()
            .ToListAsync();

        var availableUsers = users.Except(hearingOwners);

        var availableStaff = await Context.SystemUsers.Where(x => availableUsers.Contains(x.SystemUserId))
            .Select(x => new AvailableStaffResponse { UserId = x.SystemUserId, FullName = x.FullName, Username = x.Username })
            .ToListAsync();

        foreach (var staff in availableStaff)
        {
            staff.SameDayHearings = await Context.Hearings
                .Where(x => x.LocalStartDateTime.Value.Date == request.LocalStartDatetime.Date && x.HearingOwner == staff.UserId)
                .Select(x => new SameDayHearing { HearingId = x.HearingId, LocalStartDateTime = x.LocalStartDateTime.Value, LocalEndDateTime = x.LocalEndDateTime.Value, HearingStartDateTime = x.HearingStartDateTime.ToCmDateTimeString(), HearingEndDateTime = x.HearingEndDateTime.ToCmDateTimeString() })
                .ToListAsync();
        }

        return availableStaff;
    }

    public async Task<List<AvailableConferenceBridgesResponse>> GetAvailableHearingsByPeriod(AvailableConferenceBridgesRequest request, IEnumerable<int> activeBridges)
    {
        var busyConferenceBridges = await Context.Hearings
            .Where(x => (x.LocalEndDateTime > request.LocalStartDatetime
                         && x.LocalStartDateTime < request.LocalEndDatetime)
                        && activeBridges.Contains(x.ConferenceBridgeId.Value))
            .Select(x => x.ConferenceBridgeId.Value)
            .ToListAsync();

        var availableBridges = activeBridges.Except(busyConferenceBridges);

        var conferenceBridges = await Context.ConferenceBridges.Where(x => availableBridges.Contains(x.ConferenceBridgeId))
            .Select(x => new AvailableConferenceBridgesResponse { BridgeId = x.ConferenceBridgeId, BridgeType = x.BridgeType, PreferredStartTime = x.PreferredStartTime, PreferredOwner = x.PreferredOwner }).ToListAsync();

        foreach (var cb in conferenceBridges)
        {
            cb.SameDayHearings = await Context.Hearings
                .Where(x => x.LocalStartDateTime.Value.Date == request.LocalStartDatetime.Date && x.ConferenceBridgeId == cb.BridgeId)
                .Select(x => new SameDayHearing { HearingId = x.HearingId, LocalStartDateTime = x.LocalStartDateTime.Value, LocalEndDateTime = x.LocalEndDateTime.Value, HearingStartDateTime = x.HearingStartDateTime.ToCmDateTimeString(), HearingEndDateTime = x.HearingEndDateTime.ToCmDateTimeString() })
                .ToListAsync();
        }

        return conferenceBridges;
    }

    public async Task<List<Hearing>> GetHearings(int? userId, DateTime afterDate, int index, int count)
    {
        var hearings = await Context.Hearings
            .Include(h => h.DisputeHearings)
            .Where(x => x.HearingOwner == userId && x.CreatedDate > afterDate && !x.DisputeHearings.Any(dh => dh.DisputeGuid == null))
            .OrderBy(x => x.LocalStartDateTime)
            .ApplyPaging(count, index)
            .ToListAsync();

        return hearings;
    }

    public async Task<List<Hearing>> GetActiveHearings(Guid disputeGuid)
    {
        var responseHearings = new List<Hearing>();

        var disputeHearings = await Context.DisputeHearings
            .Where(d => d.DisputeGuid == disputeGuid)
            .ToListAsync();

        foreach (var disputeHearing in disputeHearings.Where(disputeHearing => disputeHearing.DisputeHearingStatus == (byte)DisputeHearingStatus.Active))
        {
            var hearing =
                await Context.Hearings.FindAsync(disputeHearing.HearingId);
            responseHearings.Add(hearing);
        }

        return responseHearings;
    }

    public async Task<DateTime?> GetLastModifiedDate(int hearingId)
    {
        var dates = await Context.Hearings
            .Where(c => c.HearingId == hearingId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> IsHearingExist(int userId, DateTime startDateTime, DateTime endDataTime)
    {
        var isAny = await Context.Hearings.AnyAsync(x => x.HearingOwner == userId
                                                         && x.LocalEndDateTime >= startDateTime && x.LocalStartDateTime <= endDataTime);
        return isAny;
    }

    public async Task<int> GetHearingsCount(int schedulePeriodId, DateTime periodStart, DateTime periodEnd)
    {
        var count = await Context.Hearings.CountAsync(x => x.HearingStartDateTime >= periodStart && x.HearingStartDateTime <= periodEnd);
        return count;
    }

    public async Task<bool> IsAssignedHearings(int userId, DateTime blockStart)
    {
        var isAnyAssigned = await Context
            .Hearings
            .AnyAsync(x => x.HearingOwner == userId && x.HearingStartDateTime.HasValue && x.HearingStartDateTime.Value.Date == blockStart.Date);
        return isAnyAssigned;
    }

    public async Task<int> GetAssociatedHearingsCount(DateTime blockStart, DateTime blockEnd, int systemUserId)
    {
        var count = await Context
            .Hearings
            .CountAsync(x => x.HearingOwner == systemUserId
                             && ((x.HearingStartDateTime.HasValue
                                  && x.HearingStartDateTime.Value > blockStart
                                  && x.HearingStartDateTime.Value < blockEnd)
                                 || (x.HearingEndDateTime.HasValue
                                     && x.HearingEndDateTime.Value > blockStart
                                     && x.HearingEndDateTime.Value < blockEnd)
                                 || (x.HearingStartDateTime.HasValue && x.HearingEndDateTime.HasValue
                                    && x.HearingStartDateTime <= blockStart
                                    && x.HearingEndDateTime >= blockEnd)));

        return count;
    }

    public async Task<List<int>> GetHearingsByHearingStartDate(DateTime startDate, DateTime endDate, List<int> disputeHearings)
    {
        var emptyHearings = await Context.Hearings
            .Where(x => x.HearingStartDateTime >= startDate && x.HearingStartDateTime <= endDate)
            .Select(x => x.HearingId)
            .Where(h => disputeHearings.All(dh => dh != h))
            .ToListAsync();

        return emptyHearings;
    }

    public async Task<decimal> GetAvgNext10HearingDays(int dayInterval, byte hearingPriority, List<int> disputeHearings)
    {
        var totalDays = await Context
            .Hearings
            .Where(x => x.HearingStartDateTime >= DateTime.UtcNow.AddDays(dayInterval)
                        && x.HearingPriority == hearingPriority && x.IsDeleted != true && !disputeHearings.Contains(x.HearingId))
            .OrderBy(x => x.HearingStartDateTime)
            .Take(10)
            .Select(x => (x.HearingStartDateTime.Value - DateTime.UtcNow).TotalDays)
            .ToListAsync();

        var average = totalDays.Count > 0 ? totalDays.Average() : 0;

        var res = decimal.Round((decimal)average, 2);

        return res;
    }

    public async Task<List<Hearing>> GetReserveAvailableHearings(ReserveAvailableHearingsRequest request)
    {
        List<Hearing> hearings;
        var predicate = PredicateBuilder.True<Hearing>();

        predicate = predicate.And(x => x.HearingReservedUntil == null || x.HearingReservedUntil <= DateTime.UtcNow);
        predicate = predicate.And(x => x.LocalStartDateTime >= request.MinHearingStartTime);
        predicate = predicate.And(x => x.DisputeHearings.Count == 0);

        if (request.MaxHearingStartTime.HasValue)
        {
            predicate = predicate.And(x => x.LocalStartDateTime <= request.MaxHearingStartTime);
        }

        if (request.IncludedPriorities is { Length: > 0 })
        {
            predicate = predicate.And(x => request.IncludedPriorities.Contains(x.HearingPriority));
        }

        if (request.HearingsToReserve.HasValue)
        {
            hearings = await Context.Hearings
                .Include(x => x.DisputeHearings)
                .Where(predicate)
                .Take(request.HearingsToReserve.Value)
                .ToListAsync();
        }
        else
        {
            hearings = await Context.Hearings
                .Include(x => x.DisputeHearings)
                .Where(predicate)
                .Take(1)
                .ToListAsync();
        }

        var finalHearings = hearings.OrderByDescending(x => x.HearingStartDateTime).ToList();

        return finalHearings;
    }

    public async Task<Hearing> GetWithDisputeHearings(int hearingId)
    {
        var hearing = await Context.Hearings
            .Include(x => x.DisputeHearings)
            .FirstOrDefaultAsync(x => x.HearingId == hearingId);

        return hearing;
    }

    public async Task<List<Hearing>> GetFactHearings(List<int> excludedHearings, int dateDelay)
    {
        var disputeHearings = await Context.DisputeHearings
            .Include(x => x.Dispute)
            .Include(x => x.Hearing)
            .ThenInclude(x => x.HearingParticipations)
            .ThenInclude(x => x.Participant)
            .Where(x => !excludedHearings.Contains(x.HearingId)
            && x.Hearing.HearingEndDateTime.HasValue
            && x.Hearing.HearingEndDateTime <= DateTime.UtcNow.AddDays(-dateDelay)
            && x.Hearing.HearingParticipations != null
            && !x.Hearing.HearingParticipations
                .Where(hp => hp.ParticipationStatus == null)
                .Select(hp => hp.HearingId)
                .Contains(x.HearingId)
            && x.Hearing.HearingDuration != null)
            .ToListAsync();

        var hearings = disputeHearings.Select(x => x.Hearing);
        var result = hearings.DistinctBy(x => x.HearingId).ToList();

        return result;
    }

    public async Task<bool> IsBookedHearingByConferenceBridgeAndDate(int conferenceBridgeId, DateTime startTime, DateTime endTime)
    {
        var isExist = await Context.Hearings.AnyAsync(x => x.ConferenceBridgeId == conferenceBridgeId && startTime < x.LocalEndDateTime && endTime > x.LocalStartDateTime);
        return isExist;
    }
}