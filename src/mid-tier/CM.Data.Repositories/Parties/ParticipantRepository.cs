using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Parties;

public class ParticipantRepository : CmRepository<Participant>, IParticipantRepository
{
    public ParticipantRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var participant = await Context.Participants.FindAsync(id);
        if (participant != null)
        {
            participant.IsDeleted = true;
            Context.Participants.Attach(participant);
            Context.Entry(participant).State = EntityState.Modified;
            return true;
        }

        return false;
    }

    public async Task<List<Participant>> GetDisputeParticipantsAsync(Guid disputeGuid)
    {
        var participants = await Context.Participants
            .Where(p => p.DisputeGuid == disputeGuid)
            .ToListAsync();
        return participants;
    }

    public async Task<List<Participant>> GetDisputeActiveParticipantsAsync(Guid disputeGuid)
    {
        var participants = await Context.Participants
            .Where(p => p.DisputeGuid == disputeGuid && (p.ParticipantStatus != (byte)ParticipantStatus.Removed && p.ParticipantStatus != (byte)ParticipantStatus.Deleted))
            .ToListAsync();
        return participants;
    }

    public async Task<List<Participant>> GetActiveApplicantsAsync(Guid disputeGuid)
    {
        var applicants = new List<Participant>();

        var claimGroups = await Context.ClaimGroups
            .Where(c => c.DisputeGuid == disputeGuid).ToListAsync();

        foreach (var claimGroup in claimGroups)
        {
            if (claimGroup != null)
            {
                var claimGroupParticipants =
                    await Context.ClaimGroupParticipants
                        .Where(c => c.GroupParticipantRole == (byte)ParticipantRole.Applicant && c.ClaimGroupId == claimGroup.ClaimGroupId)
                        .ToListAsync();

                foreach (var claimGroupParticipant in claimGroupParticipants)
                {
                    var participant = await Context.Participants
                        .SingleOrDefaultAsync(p => p.ParticipantId == claimGroupParticipant.ParticipantId && (p.ParticipantStatus != (byte)ParticipantStatus.Removed && p.ParticipantStatus != (byte)ParticipantStatus.Deleted));
                    if (participant != null)
                    {
                        applicants.Add(participant);
                    }
                }
            }
        }

        return applicants;
    }

    public async Task<List<Participant>> GetActiveRespondentsAsync(Guid disputeGuid)
    {
        var respondents = new List<Participant>();

        var claimGroups = await Context.ClaimGroups
            .Where(c => c.DisputeGuid == disputeGuid).ToListAsync();

        foreach (var claimGroup in claimGroups)
        {
            if (claimGroup != null)
            {
                var claimGroupParticipants =
                    await Context.ClaimGroupParticipants
                        .Where(c => c.GroupParticipantRole == (byte)ParticipantRole.Respondent && c.ClaimGroupId == claimGroup.ClaimGroupId)
                        .ToListAsync();

                foreach (var claimGroupParticipant in claimGroupParticipants)
                {
                    var participant = await Context.Participants
                        .SingleOrDefaultAsync(p => p.ParticipantId == claimGroupParticipant.ParticipantId && (p.ParticipantStatus != (byte)ParticipantStatus.Removed && p.ParticipantStatus != (byte)ParticipantStatus.Deleted));
                    if (participant != null)
                    {
                        respondents.Add(participant);
                    }
                }
            }
        }

        return respondents;
    }

    public async Task<List<Participant>> GetRespondentsAsync(Guid disputeGuid)
    {
        var respondents = new List<Participant>();

        var claimGroup = await Context.ClaimGroups
            .SingleOrDefaultAsync(c => c.DisputeGuid == disputeGuid);

        if (claimGroup != null)
        {
            var claimGroupParticipants =
                await Context.ClaimGroupParticipants
                    .Where(c => c.GroupParticipantRole == (byte)ParticipantRole.Respondent && c.ClaimGroupId == claimGroup.ClaimGroupId)
                    .ToListAsync();

            foreach (var claimGroupParticipant in claimGroupParticipants)
            {
                var participant = await Context.Participants
                    .SingleOrDefaultAsync(p => p.ParticipantId == claimGroupParticipant.ParticipantId);
                respondents.Add(participant);
            }

            return respondents;
        }

        return null;
    }

    public async Task<Participant> GetPrimaryApplicantAsync(Guid disputeGuid)
    {
        var claimGroup = await Context.ClaimGroups
            .Include(c => c.ClaimGroupParticipants)
            .SingleOrDefaultAsync(c => c.DisputeGuid == disputeGuid);

        if (claimGroup != null)
        {
            foreach (var claimGroupParticipant in claimGroup.ClaimGroupParticipants)
            {
                if (claimGroupParticipant.GroupParticipantRole == (int)ParticipantRole.Applicant && claimGroupParticipant.GroupPrimaryContactId != null)
                {
                    var participant = await Context.Participants.FindAsync(claimGroupParticipant.GroupPrimaryContactId);
                    if (participant != null)
                    {
                        if (participant.ParticipantStatus != (byte)ParticipantStatus.Removed || participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
                        {
                            return participant;
                        }
                    }

                    return null;
                }
            }
        }

        return null;
    }

    public async Task<Participant> GetPrimaryApplicantByIdAsync(int participantId)
    {
        var disputeParticipant = await GetByIdAsync(participantId);
        if (disputeParticipant != null)
        {
            var claimGroup = await Context.ClaimGroups
                .Include(c => c.ClaimGroupParticipants)
                .FirstOrDefaultAsync(c => c.DisputeGuid == disputeParticipant.DisputeGuid);

            if (claimGroup != null)
            {
                foreach (var claimGroupParticipant in claimGroup.ClaimGroupParticipants)
                {
                    if (claimGroupParticipant.GroupParticipantRole == (int)ParticipantRole.Applicant && claimGroupParticipant.GroupPrimaryContactId != null)
                    {
                        var participant = await Context.Participants.FindAsync(claimGroupParticipant.GroupPrimaryContactId);
                        if (participant != null)
                        {
                            if (participant.ParticipantStatus != (byte)ParticipantStatus.Removed || participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
                            {
                                return participant;
                            }
                        }

                        return null;
                    }
                }
            }
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int participantId)
    {
        var dates = await Context.Participants
            .Where(p => p.ParticipantId == participantId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> CheckIfAccessCodeExists(string evidenceCode)
    {
        var exists = await Context.Participants.AnyAsync(x => x.AccessCode == evidenceCode);
        return exists;
    }

    public async Task<Participant> GetByAccessCode(string accessCode)
    {
        var participant = await Context.Participants
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.AccessCode.Equals(accessCode));

        return participant;
    }

    public async Task<Participant> GetByAccessCodeWithDispute(string accessCode)
    {
        var participant = await Context.Participants
            .AsNoTracking()
            .Include(p => p.Dispute)
            .Include(x => x.Dispute.DisputeLastModified)
            .FirstOrDefaultAsync(p => p.AccessCode.Equals(accessCode));

        return participant;
    }

    public async Task<bool> CheckDisputeParticipant(int participantId, Guid disputeGuid)
    {
        var result = await Context.Participants.AnyAsync(x => x.ParticipantId.Equals(participantId) && x.DisputeGuid.Equals(disputeGuid));
        return result;
    }

    public async Task<Participant> GetWithUser(int id)
    {
        var participant = await Context.Participants.Include(p => p.SystemUser).FirstOrDefaultAsync(p => p.ParticipantId.Equals(id));
        return participant;
    }

    public async Task<int> GetSameAbbreviationsCount(Guid disputeGuid, string abbreviation)
    {
        var parties = await Context.Participants.IgnoreQueryFilters().Where(x => x.DisputeGuid == disputeGuid && x.NameAbbreviation.StartsWith(abbreviation)).ToListAsync();
        return parties.Count;
    }

    public async Task<Participant> GetDisputeActiveParticipant(Guid disputeGuid, int submitterId)
    {
        var participant = await Context.Participants
            .FirstOrDefaultAsync(p => p.DisputeGuid == disputeGuid
                                      && p.ParticipantId == submitterId
                                      && (p.ParticipantStatus != (byte)ParticipantStatus.Removed && p.ParticipantStatus != (byte)ParticipantStatus.Deleted));

        return participant;
    }

    public async Task<bool> IsActiveParticipantExists(int descriptionBy)
    {
        var exists = await Context
            .Participants
            .AnyAsync(x => x.ParticipantId == descriptionBy &&
                           x.ParticipantStatus != (byte)ParticipantStatus.Removed &&
                           x.ParticipantStatus != (byte)ParticipantStatus.Deleted);
        return exists;
    }
}