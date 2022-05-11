using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.InternalUserProfile;

public interface IInternalUserProfileRepository : IRepository<Model.InternalUserProfile>
{
    Task<DateTime?> GetLastModifiedDateAsync(int internalUserProfileId);

    Task<Model.InternalUserProfile> GetByUserIdAsync(int internalUserId);
}