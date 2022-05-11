using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Hearings;

public class HearingParticipationRepository : CmRepository<HearingParticipation>, IHearingParticipationRepository
{
    public HearingParticipationRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var hearingParticipation = await Context.HearingParticipations.FindAsync(id);

        if (hearingParticipation != null)
        {
            hearingParticipation.IsDeleted = true;
            Context.HearingParticipations.Attach(hearingParticipation);
            Context.Entry(hearingParticipation).State = EntityState.Modified;

            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int hearingParticipationId)
    {
        var dates = await Context.HearingParticipations.Where(p => p.HearingParticipationId == hearingParticipationId).Select(d => d.ModifiedDate).ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> CheckHearingParticipationExistenceAsync(int hearingParticipationId)
    {
        var res = await Context.HearingParticipations.AnyAsync(c => c.HearingParticipationId == hearingParticipationId);

        return res;
    }

    public async Task<List<HearingParticipation>> GetHearingParticipationListAsync(int hearingId)
    {
        var hearingParticipationList = await Context.HearingParticipations.Where(c => c.HearingId == hearingId && c.ParticipationStatus == (byte)ParticipationStatus.Participated).ToListAsync();

        return hearingParticipationList;
    }

    public async Task<HearingParticipation> GetHearingParticipation(int hearingId, int participantId, Guid disputeGuid)
    {
        var hearingParticipation = await Context
            .HearingParticipations
            .FirstOrDefaultAsync(x => x.HearingId == hearingId
                                      && x.ParticipantId == participantId
                                      && x.DisputeGuid == disputeGuid);
        return hearingParticipation;
    }

    public async Task<HearingParticipation> CheckHearingParticipationRelationAsync(int hearingId)
    {
        var res = await Context.HearingParticipations.FirstOrDefaultAsync(c => c.HearingId == hearingId);

        return res;
    }
}