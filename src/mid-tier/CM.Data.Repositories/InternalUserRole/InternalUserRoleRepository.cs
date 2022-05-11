using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.InternalUserRole;

public class InternalUserRoleRepository : CmRepository<Model.InternalUserRole>, IInternalUserRoleRepository
{
    public InternalUserRoleRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.InternalUserRole> GetByUserId(int userId)
    {
        var internalUser = await Context.InternalUserRoles.FirstOrDefaultAsync(x => x.UserId.Equals(userId));

        return internalUser;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int internalUserRoleId)
    {
        var dates = await Context.InternalUserRoles
            .Where(p => p.InternalUserRoleId == internalUserRoleId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}