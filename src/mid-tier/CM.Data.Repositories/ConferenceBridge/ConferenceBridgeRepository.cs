using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ConferenceBridge;

public class ConferenceBridgeRepository : CmRepository<Model.ConferenceBridge>, IConferenceBridgeRepository
{
    public ConferenceBridgeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int conferenceBridgeId)
    {
        var dates = await Context.ConferenceBridges
            .Where(c => c.ConferenceBridgeId == conferenceBridgeId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> IsModeratorCodeExist(string moderatorCode)
    {
        var isExist = await Context.ConferenceBridges.AnyAsync(c => c.ModeratorCode == moderatorCode);
        return isExist;
    }

    public async Task<bool> IsParticipantCodeExist(string participantCode)
    {
        var isExist = await Context.ConferenceBridges.AnyAsync(c => c.ParticipantCode == participantCode);
        return isExist;
    }

    public async Task<List<Model.ConferenceBridge>> GetAllByOwnerAsync(int ownerId)
    {
        var conferenceBridges = await Context.ConferenceBridges
            .Where(c => c.PreferredOwner == ownerId)
            .ToListAsync();

        return conferenceBridges;
    }

    public async Task<List<Model.ConferenceBridge>> GetAccordingScheduleForCheck(int? systemUserId, TimeSpan? time)
    {
        if (time == null)
        {
            throw new ArgumentNullException(nameof(time), "Time cannot be null");
        }

        var conferenceBridges = await Context.ConferenceBridges.AsNoTracking()
            .Where(x => x.PreferredOwner == systemUserId)
            .ToListAsync();

        var conferenceBridgesFiltered = conferenceBridges
            .Where(x => x.PreferredStartTime.HasValue && x.PreferredStartTime.Value.TimeOfDay == time)
            .ToList();

        return conferenceBridgesFiltered;
    }

    public async Task<List<Model.ConferenceBridge>> GetAccordingSchedule(int? systemUserId, TimeSpan? time)
    {
        List<Model.ConferenceBridge> conferenceBridges;

        if (!time.HasValue && !systemUserId.HasValue)
        {
            conferenceBridges = await Context.ConferenceBridges.AsNoTracking()
                .Where(x => x.PreferredOwner == null && !x.PreferredStartTime.HasValue)
                .ToListAsync();
        }
        else if (!time.HasValue && systemUserId.HasValue)
        {
            conferenceBridges = await Context.ConferenceBridges.AsNoTracking()
                .Where(x => x.PreferredOwner == systemUserId && !x.PreferredStartTime.HasValue)
                .ToListAsync();
        }
        else
        {
            conferenceBridges = await Context.ConferenceBridges.AsNoTracking()
                .Where(x => x.PreferredOwner == systemUserId)
                .ToListAsync();

            conferenceBridges = conferenceBridges
                .Where(x => x.PreferredStartTime.HasValue && x.PreferredStartTime.Value.TimeOfDay == time)
                .ToList();
        }

        return conferenceBridges;
    }

    public async Task<List<Model.ConferenceBridge>> GetOpenConferenceBridges()
    {
        var conferenceBridges = await Context.ConferenceBridges.AsNoTracking()
            .Where(x => x.PreferredOwner == null)
            .ToListAsync();

        return conferenceBridges;
    }

    public async Task<int[]> GetActiveConferenceBridges()
    {
        var conferenceBridges = await Context.ConferenceBridges
            .Where(x => x.BridgeStatus == (int)BridgeStatus.Active)
            .Select(c => c.ConferenceBridgeId)
            .ToListAsync();

        return conferenceBridges.ToArray();
    }
}