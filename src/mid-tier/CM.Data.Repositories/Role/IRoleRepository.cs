using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Role;

public interface IRoleRepository : IRepository<SystemUserRole>
{
    Task<int> GetSessionDuration(int roleId);
}