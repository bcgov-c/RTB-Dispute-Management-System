using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.InternalUserRole;

public class InternalUserRoleService : CmServiceBase, IInternalUserRoleService
{
    public InternalUserRoleService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<InternalUserRoleResponse> CreateAsync(int userId, InternalUserRoleRequest request)
    {
        var newInternalUserRole = MapperService.Map<InternalUserRoleRequest, Data.Model.InternalUserRole>(request);
        newInternalUserRole.UserId = userId;
        var internalUserRoleResult = await UnitOfWork.InternalUserRoleRepository.InsertAsync(newInternalUserRole);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.InternalUserRole, InternalUserRoleResponse>(internalUserRoleResult);
        }

        return null;
    }

    public async Task<InternalUserRoleResponse> PatchAsync(Data.Model.InternalUserRole internalUserRole)
    {
        UnitOfWork.InternalUserRoleRepository.Attach(internalUserRole);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.InternalUserRole, InternalUserRoleResponse>(internalUserRole);
        }

        return null;
    }

    public async Task<Data.Model.InternalUserRole> GetNoTrackingInternalUserRoleAsync(int id)
    {
        var internalUserRole = await UnitOfWork.InternalUserRoleRepository.GetNoTrackingByIdAsync(p => p.InternalUserRoleId == id);
        return internalUserRole;
    }

    public async Task<bool> IsUserActive(int userId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetUserWithFullInfo(userId);
        if (user?.IsActive != null && (bool)user.IsActive && user.SystemUserRoleId.Equals((int)Roles.StaffUser))
        {
            return true;
        }

        return false;
    }

    public async Task<bool> IfDuplicateRecordExists(int userId, int roleGroupId, byte? roleSubTypeId)
    {
        var internalUserRoles = await UnitOfWork.InternalUserRoleRepository
            .FindAllAsync(i => i.UserId == userId && i.RoleGroupId == roleGroupId && i.RoleSubtypeId == roleSubTypeId);

        if (internalUserRoles != null && internalUserRoles.Any())
        {
            return true;
        }

        return false;
    }

    public async Task<bool> InternalUserIsValid(int userId)
    {
        var internalUserRole = await UnitOfWork.InternalUserRoleRepository.GetByUserId(userId);
        if (internalUserRole is { RoleGroupId: (byte)RoleGroup.Arbitrator })
        {
            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.InternalUserRoleRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }
}