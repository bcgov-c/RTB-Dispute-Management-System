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

    public async Task<IList<Model.ConferenceBridge>> GetAvailableBridges(DateTime dateTime)
    {
        var hearings = await Context
            .Hearings
            .Where(x => x.LocalStartDateTime.HasValue && x.LocalStartDateTime.Value.Date == dateTime.Date && x.ConferenceBridgeId.HasValue)
            .ToListAsync();
        var confBridges = hearings.Select(x => x.ConferenceBridgeId.Value);

        var bridges = await Context.ConferenceBridges
        .Where(x => !confBridges.Contains(x.ConferenceBridgeId) && x.BridgeStatus != (byte?)BridgeStatus.Inactive)
        .ToListAsync();

        return bridges;
    }

    public async Task<bool> IsBridgeBooked(int conferenceBridgeId, DateTime startTime)
    {
        var isBooked = await Context
            .Hearings
            .AnyAsync(x => x.LocalStartDateTime.HasValue &&
                        x.LocalStartDateTime.Value.Date == startTime.Date &&
                        x.ConferenceBridgeId.HasValue &&
                        x.ConferenceBridgeId == conferenceBridgeId);

        return isBooked;
    }
}