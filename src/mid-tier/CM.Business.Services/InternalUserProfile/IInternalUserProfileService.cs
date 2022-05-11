using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.InternalUserProfile;

namespace CM.Business.Services.InternalUserProfile;

public interface IInternalUserProfileService : IServiceBase
{
    Task<InternalUserProfileResponse> CreateAsync(int internalUserId, InternalUserProfileRequest request);

    Task<InternalUserProfileResponse> PatchAsync(Data.Model.InternalUserProfile internalUserProfile);

    Task<List<InternalUserProfileResponse>> GetAllAsync();

    Task<Data.Model.InternalUserProfile> GetNoTrackingInternalUserProfileAsync(int id);

    Task<bool> UserExists(int internalUserId);

    Task<bool> InternalUserProfileExists(int internalUserId);
}