using System.Threading.Tasks;
using AutoMapper;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.RoleService;

public class RoleService : CmServiceBase, IRoleService
{
    public RoleService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<SystemUserRole> GetRole(int roleId)
    {
        var role = await UnitOfWork.RoleRepository.GetByIdAsync(roleId);
        return role;
    }
}