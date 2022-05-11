using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Parties;

public class ClaimGroupParticipantRepository : CmRepository<ClaimGroupParticipant>, IClaimGroupParticipantRepository
{
    public ClaimGroupParticipantRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<string> GetPrimaryApplicantAccessCode(Guid disputeGuid)
    {
        var claimGroupParticipants = await Context.ClaimGroupParticipants
            .Where(
                c => c.DisputeGuid == disputeGuid &&
                     c.GroupPrimaryContactId != null &&
                     c.ParticipantId == c.GroupPrimaryContactId &&
                     c.GroupParticipantRole == (byte)ParticipantRole.Applicant)
            .ToListAsync();

        foreach (var claimGroupParticipant in claimGroupParticipants)
        {
            var participant = await Context
                .Participants
                .SingleOrDefaultAsync(x => x.ParticipantId == claimGroupParticipant.ParticipantId && x.ParticipantStatus != (byte)ParticipantStatus.Removed && x.ParticipantStatus != (byte)ParticipantStatus.Deleted);
            if (participant != null)
            {
                return participant.AccessCode;
            }
        }

        return string.Empty;
    }

    public async Task<List<ClaimGroupParticipant>> GetDisputeClaimGroupParticipants(int claimGroupId)
    {
        var claimGroupParticipants = await
            Context.ClaimGroupParticipants.Where(c => c.ClaimGroupId == claimGroupId).ToListAsync();
        return claimGroupParticipants;
    }

    public async Task<bool> CheckParticipantExistence(int participantId)
    {
        var res = await Context.Participants.AnyAsync(c => c.ParticipantId == participantId);

        return res;
    }

    public async Task<ClaimGroupParticipant> CheckParticipantRelation(int participantId)
    {
        var res = await Context.ClaimGroupParticipants.FirstOrDefaultAsync(c => c.ParticipantId == participantId);

        return res;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int groupParticipantId)
    {
        var dates = await Context.ClaimGroupParticipants
            .Where(cg => cg.ClaimGroupParticipantId == groupParticipantId)
            .Select(cg => cg.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<ClaimGroupParticipant>> GetByClaimGroupIdAsync(int claimGroupId)
    {
        var claimGroupParticipants =
            await Context.ClaimGroupParticipants
                .Include(cg => cg.Participant)
                .Where(x => x.ClaimGroupId.Equals(claimGroupId)).ToListAsync();
        return claimGroupParticipants;
    }

    public async Task<List<int>> GetActiveRespondentParticipants(Guid disputeGuid)
    {
        var participants = await Context.ClaimGroupParticipants
            .Include(x => x.Participant)
            .Where(x => x.DisputeGuid == disputeGuid &&
                        x.GroupParticipantRole == (byte)ParticipantRole.Respondent &&
                        (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed || x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted))
            .Select(x => x.ParticipantId)
            .ToListAsync();

        return participants;
    }

    public async Task<ClaimGroupParticipant> GetDisputeClaimGroupParticipant(Guid disputeGuid, int claimGroupId)
    {
        var claimGroupParticipant = await
            Context.ClaimGroupParticipants.FirstOrDefaultAsync(c => c.ClaimGroupId == claimGroupId && c.DisputeGuid == disputeGuid);
        return claimGroupParticipant;
    }

    public async Task<ClaimGroupParticipant> GetClaimGroupParticipantByParticipantId(int participantId)
    {
        var claimGroupParticipant = await
            Context.ClaimGroupParticipants.FirstOrDefaultAsync(x => x.ParticipantId == participantId);

        return claimGroupParticipant;
    }
}