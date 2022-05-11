using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.InternalUserProfile;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.InternalUserProfile;

public class InternalUserProfileService : CmServiceBase, IInternalUserProfileService
{
    public InternalUserProfileService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<InternalUserProfileResponse> CreateAsync(int internalUserId, InternalUserProfileRequest request)
    {
        var internalUserProfile = MapperService.Map<InternalUserProfileRequest, Data.Model.InternalUserProfile>(request);
        internalUserProfile.InternalUserId = internalUserId;

        var internalUserProfileResult = await UnitOfWork.InternalUserProfileRepository.InsertAsync(internalUserProfile);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.InternalUserProfile, InternalUserProfileResponse>(internalUserProfileResult);
        }

        return null;
    }

    public async Task<InternalUserProfileResponse> PatchAsync(Data.Model.InternalUserProfile internalUserProfile)
    {
        UnitOfWork.InternalUserProfileRepository.Attach(internalUserProfile);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.InternalUserProfile, InternalUserProfileResponse>(internalUserProfile);
        }

        return null;
    }

    public async Task<List<InternalUserProfileResponse>> GetAllAsync()
    {
        var internalUserProfiles = await UnitOfWork.InternalUserProfileRepository.GetAllAsync();
        if (internalUserProfiles != null)
        {
            return MapperService.Map<List<Data.Model.InternalUserProfile>, List<InternalUserProfileResponse>>(internalUserProfiles.ToList());
        }

        return null;
    }

    public async Task<Data.Model.InternalUserProfile> GetNoTrackingInternalUserProfileAsync(int id)
    {
        var internalUserProfile = await UnitOfWork.InternalUserProfileRepository.GetNoTrackingByIdAsync(p => p.InternalUserProfileId == id);
        return internalUserProfile;
    }

    public async Task<bool> UserExists(int internalUserId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetAdminUser(internalUserId);
        return user != null;
    }

    public async Task<bool> InternalUserProfileExists(int internalUserId)
    {
        var internalUserProfile = await UnitOfWork.InternalUserProfileRepository.GetByUserIdAsync(internalUserId);
        if (internalUserProfile != null)
        {
            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.InternalUserProfileRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }
}