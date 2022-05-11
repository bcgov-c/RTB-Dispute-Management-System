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
}