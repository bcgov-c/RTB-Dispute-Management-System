using System.Threading.Tasks;
using CM.Business.Entities.Models.InternalUserRole;

namespace CM.Business.Services.InternalUserRole;

public interface IInternalUserRoleService : IServiceBase
{
    Task<InternalUserRoleResponse> CreateAsync(int userId, InternalUserRoleRequest request);

    Task<InternalUserRoleResponse> PatchAsync(Data.Model.InternalUserRole internalUserRole);

    Task<Data.Model.InternalUserRole> GetNoTrackingInternalUserRoleAsync(int id);

    Task<bool> IsUserActive(int userId);

    Task<bool> IfDuplicateRecordExists(int userId, int roleGroupId, byte? roleSubTypeId);

    Task<bool> InternalUserIsValid(int userId);
}