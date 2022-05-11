using System.Threading.Tasks;
using CM.Data.Model;

namespace CM.Business.Services.RoleService;

public interface IRoleService
{
    Task<SystemUserRole> GetRole(int roleId);
}