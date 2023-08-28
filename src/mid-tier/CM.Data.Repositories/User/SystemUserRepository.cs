using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.User;

public class SystemUserRepository : CmRepository<SystemUser>, ISystemUserRepository
{
    public SystemUserRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public SystemUser GetUser(string username, string password)
    {
        var user = Context.SystemUsers.SingleOrDefault(u => u.Username == username && u.Password == password && u.IsActive == true);
        return user;
    }

    public async Task<SystemUser> GetUserWithFullInfo(int id)
    {
        var user = await Context.SystemUsers
            .Include(u => u.SystemUserRole)
            .Include(d => d.DisputeUsers)
            .SingleOrDefaultAsync(s => s.SystemUserId == id);

        return user;
    }

    public async Task<DateTime?> GetLastModifiedDate(int userId)
    {
        var lastModifiedDate = await Context.SystemUsers
            .Where(d => d.SystemUserId == userId)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }

    public async Task<List<SystemUser>> GetInternalUsersWithRolesAsync()
    {
        var adminRole = await Context.SystemUserRoles
            .SingleOrDefaultAsync(r => r.RoleName == RoleNames.Admin);

        var internalUsers = await Context.SystemUsers
            .Where(u => u.SystemUserRoleId == adminRole.SystemUserRoleId)
            .Include(r => r.InternalUserRoles)
            .ToListAsync();

        return internalUsers;
    }

    public async Task<List<SystemUser>> GetUsersByRole(int systemUserRoleId)
    {
        var users = await Context.SystemUsers
            .Where(u => u.SystemUserRoleId == systemUserRoleId)
            .ToListAsync();

        return users;
    }

    public async Task<SystemUser> GetAdminUser(int userId)
    {
        var user = await Context.SystemUsers.SingleOrDefaultAsync(u =>
            u.SystemUserId == userId && u.SystemUserRoleId == (int)Roles.StaffUser);

        return user;
    }

    public async Task<SystemUser> GetUserByUserGuid(Guid userGuid)
    {
        var user = await Context.SystemUsers.SingleOrDefaultAsync(u => u.UserGuid == userGuid);
        return user;
    }

    public async Task<SystemUser> GetUserWithInternalRolesAsync(int userId)
    {
        var user = await Context.SystemUsers
            .Include(u => u.InternalUserRoles)
            .SingleOrDefaultAsync(u => u.SystemUserId == userId);

        return user;
    }

    public async Task<int[]> GetAvailableUsersAsync(byte roleGroup, byte? roleSubgroup)
    {
        var internalUserRoles = await Context.InternalUserRoles
            .Include(u => u.SystemUser)
            .Where(x => x.RoleGroupId == roleGroup)
            .ToListAsync();

        if (roleSubgroup.HasValue)
        {
            internalUserRoles = await internalUserRoles.Where(x => x.RoleSubtypeId == roleSubgroup.Value).ToListAsync();
        }

        var users = await internalUserRoles
            .Where(x => x.SystemUser.IsActive == true && x.SystemUser.SystemUserRoleId == (int)Roles.StaffUser)
            .Select(u => u.SystemUser.SystemUserId).ToListAsync();

        return users.ToArray();
    }

    public async Task<int> GetArbitratorUserId()
    {
        var arbitrator = await Context.SystemUsers
            .SingleOrDefaultAsync(u => u.UserGuid == Guid.Parse("8f219a4a-5d53-4e66-b6d3-99674678bbc2"));
        if (arbitrator != null)
        {
            return arbitrator.SystemUserId;
        }

        return 0;
    }

    public async Task<List<SystemUser>> GetUsers(IEnumerable<int> usersId)
    {
        var users = await Context.SystemUsers
            .Where(x => usersId.Contains(x.SystemUserId))
            .ToListAsync();
        return users;
    }
}