using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.User;

public interface ISystemUserRepository : IRepository<SystemUser>
{
    SystemUser GetUser(string username, string password);

    Task<SystemUser> GetUserWithFullInfo(int id);

    Task<DateTime?> GetLastModifiedDate(int userId);

    Task<List<SystemUser>> GetInternalUsersWithRolesAsync();

    Task<List<SystemUser>> GetUsersByRole(int systemUserRoleId);

    Task<SystemUser> GetAdminUser(int userId);

    Task<SystemUser> GetUserByUserGuid(Guid userGuid);

    Task<SystemUser> GetUserWithInternalRolesAsync(int userId);

    Task<int[]> GetAvailableUsersAsync(byte roleGroup, byte? roleSubgroup);

    Task<int> GetArbitratorUserId();

    Task<List<SystemUser>> GetUsers(IEnumerable<int> usersId);
}