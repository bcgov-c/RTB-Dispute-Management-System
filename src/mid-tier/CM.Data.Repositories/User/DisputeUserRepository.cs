using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.User;

public class DisputeUserRepository : CmRepository<DisputeUser>, IDisputeUserRepository
{
    public DisputeUserRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DisputeUser> GetByParticipant(Participant participant)
    {
        var res = await Context.DisputeUsers
            .Include(x => x.SystemUser)
            .FirstOrDefaultAsync(x => x.ParticipantId == participant.ParticipantId && x.DisputeGuid == participant.DisputeGuid);
        return res;
    }

    public async Task<List<DisputeUser>> GetDisputeUsers(Guid disputeGuid)
    {
        var res = await Context.DisputeUsers
            .Where(x => x.DisputeGuid == disputeGuid && (x.SystemUser.SystemUserRole.RoleName == RoleNames.AccessCode || x.SystemUser.SystemUserRole.RoleName == RoleNames.User))
            .Include(u => u.SystemUser)
            .ToListAsync();
        return res;
    }

    public async Task<DisputeUser> GetDisputeUser(Guid disputeGuid, int userId)
    {
        var res = await Context.DisputeUsers
            .FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid && x.SystemUserId == userId);
        return res;
    }

    public async Task<DateTime?> GetLastModifiedDate(int disputeUserId)
    {
        var dates = await Context.DisputeUsers
            .Where(c => c.DisputeUserId == disputeUserId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}