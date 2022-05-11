using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.InternalUserRole;

public interface IInternalUserRoleRepository : IRepository<Model.InternalUserRole>
{
    Task<DateTime?> GetLastModifiedDateAsync(int internalUserRoleId);

    Task<Model.InternalUserRole> GetByUserId(int userId);
}