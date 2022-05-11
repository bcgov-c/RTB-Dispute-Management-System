using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeHearing;

public class DisputeHearingRepository : CmRepository<Model.DisputeHearing>, IDisputeHearingRepository
{
    public DisputeHearingRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.DisputeHearing>> GetHearingDisputes(int hearingId)
    {
        var disputes = await Context.DisputeHearings
            .Include(d => d.Dispute)
            .Where(d => d.HearingId == hearingId)
            .Select(d => new Model.DisputeHearing
            {
                Dispute = d.Dispute,
                DisputeGuid = d.DisputeGuid,
                DisputeHearingRole = d.DisputeHearingRole,
                DisputeHearingStatus = d.DisputeHearingStatus,
                ExternalFileId = d.ExternalFileId,
                DisputeHearingId = d.DisputeHearingId,
                SharedHearingLinkType = d.SharedHearingLinkType
            }).ToListAsync();

        return disputes;
    }

    public async Task<List<Model.DisputeHearing>> GetByHearingId(int hearingId)
    {
        var result = await Context.DisputeHearings
            .Include(x => x.Dispute)
            .Where(x => x.HearingId == hearingId)
            .ToListAsync();

        return result;
    }

    public async Task<List<Model.DisputeHearing>> GetDisputeHearingsByDispute(Guid disputeGuid)
    {
        var disputeHearings = await Context.DisputeHearings
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();

        return disputeHearings;
    }

    public async Task<List<Model.DisputeHearing>> GetDisputeHearings(Guid disputeGuid)
    {
        var disputeHearings = await Context.DisputeHearings
            .Include(x => x.Hearing)
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();

        return disputeHearings;
    }

    public async Task<List<Model.DisputeHearing>> GetDisputeHearingsWithParticipations(Guid disputeGuid)
    {
        var disputeHearings = await Context.DisputeHearings
            .Include(x => x.Hearing).ThenInclude(x => x.HearingParticipations)
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();

        return disputeHearings;
    }

    public async Task<DateTime?> GetLastModifiedDate(int disputeHearingId)
    {
        var dates = await Context.DisputeHearings
            .Where(c => c.DisputeHearingId == disputeHearingId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.DisputeHearing>> GetDisputeHearingHistory(byte searchType, Guid? disputeGuid, int? hearingId, int index, int count)
    {
        if (searchType == (int)DisputeHearingHistorySearchType.DisputeGuid)
        {
            var disputeGuidResult = await Context.DisputeHearings
                .Include(x => x.Dispute)
                .IgnoreQueryFilters()
                .Where(x => x.DisputeGuid == disputeGuid.Value)
                .OrderByDescending(x => x.ModifiedDate)
                .ApplyPaging(count, index)
                .ToListAsync();

            return disputeGuidResult;
        }

        var hearingResult = await Context.DisputeHearings
            .Include(x => x.Dispute)
            .IgnoreQueryFilters()
            .Where(x => x.HearingId == hearingId.Value)
            .OrderByDescending(x => x.ModifiedDate)
            .ApplyPaging(count, index)
            .ToListAsync();

        return hearingResult;
    }

    public async Task<bool> IsFutureHearingExist(Guid disputeGuid)
    {
        var isExist = await Context.DisputeHearings
            .AnyAsync(x => x.DisputeGuid == disputeGuid && x.Hearing.LocalStartDateTime > DateTime.Now);
        return isExist;
    }

    public async Task<bool> IsOverlappedHearingExist(Guid disputeGuid, int hearingId)
    {
        var hearing = await Context.Hearings.FirstOrDefaultAsync(x => x.HearingId == hearingId);
        var isExist = await Context.DisputeHearings.AnyAsync(x => x.DisputeGuid == disputeGuid &&
                                                                  x.Hearing.LocalEndDateTime > hearing.LocalStartDateTime &&
                                                                  x.Hearing.LocalStartDateTime < hearing.LocalEndDateTime);
        return isExist;
    }

    public async Task<List<int>> GetDisputeHearingsByHearingStartDate(DateTime startDate, DateTime endDate)
    {
        var disputeHearings = await Context.DisputeHearings
            .Include(x => x.Hearing)
            .Where(x => x.Hearing.HearingStartDateTime >= startDate && x.Hearing.HearingStartDateTime <= endDate)
            .Select(x => x.HearingId)
            .Distinct()
            .ToListAsync();
        return disputeHearings;
    }

    public async Task<Model.DisputeHearing> GetLatestDisputeHearing(Guid disputeGuid, int hearingId)
    {
        var disputeHearings = await Context.DisputeHearings.Where(x => x.DisputeGuid == disputeGuid && x.HearingId == hearingId)
            .ToListAsync();

        var lastDisputeHearing = disputeHearings.OrderByDescending(d => d.DisputeHearingId).FirstOrDefault();

        return lastDisputeHearing;
    }

    public async Task<Model.DisputeHearing> GetLatestDisputeHearing(Guid disputeGuid)
    {
        var disputeHearings = await Context.DisputeHearings
            .Include(x => x.Hearing)
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();

        var lastDisputeHearing = disputeHearings.OrderByDescending(d => d.Hearing.HearingStartDateTime).FirstOrDefault();

        return lastDisputeHearing;
    }

    public async Task<int?> GetPrimaryPreviousHearingId(int hearingId, Guid primaryDisputeGuid)
    {
        var hearings = await Context.DisputeHearings
            .Include(x => x.Hearing)
            .Where(x => x.DisputeGuid == primaryDisputeGuid && x.DisputeHearingRole == (byte)DisputeHearingRole.Active)
            .OrderByDescending(x => x.Hearing.HearingStartDateTime)
            .Select(x => x.HearingId)
            .ToListAsync();

        return hearings.Count <= hearings.IndexOf(hearingId) + 1 ? null : hearings.ElementAt(hearings.IndexOf(hearingId) + 1);
    }

    public async Task<Model.DisputeHearing> GetHearingByRecordCodeAndDate(string recordCode, DateTime startDate)
    {
        var startDateFrom = startDate.AddHours(-2);
        var startDateTo = startDate.AddHours(2);

        var disputeHearing = await Context.DisputeHearings
            .Include(x => x.Dispute)
            .Include(x => x.Hearing)
            .ThenInclude(x => x.ConferenceBridge)
            .Where(dh =>
                dh.DisputeHearingRole == (byte)DisputeHearingRole.Active &&
                dh.IsDeleted != true &&
                dh.Hearing.IsDeleted != null &&
                dh.Hearing.LocalStartDateTime > startDateFrom &&
                dh.Hearing.LocalStartDateTime < startDateTo &&
                dh.Hearing.ConferenceBridge.RecordCode == recordCode)
            .ToListAsync();

        return disputeHearing.FirstOrDefault();
    }
}