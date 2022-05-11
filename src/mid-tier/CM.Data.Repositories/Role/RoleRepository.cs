using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Role;

public class RoleRepository : CmRepository<SystemUserRole>, IRoleRepository
{
    public RoleRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<int> GetSessionDuration(int roleId)
    {
        var role = await Context.SystemUserRoles
            .SingleOrDefaultAsync(r => r.SystemUserRoleId == roleId);

        if (role != null)
        {
            return role.SessionDuration;
        }

        return 0;
    }
}