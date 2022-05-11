using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.UserServices;

public class UserService : CmServiceBase, IUserService
{
    public UserService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<UserResponse> GetUser(int id)
    {
        var user = await UnitOfWork.SystemUserRepository.GetUserWithInternalRolesAsync(id);
        return MapperService.Map<SystemUser, UserResponse>(user);
    }

    public async Task<SystemUser> GetSystemUser(int id)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(id);
        return user;
    }

    public async Task<List<UserResponse>> GetInternalUsers()
    {
        var internalUsers = await UnitOfWork.SystemUserRepository.GetInternalUsersWithRolesAsync();
        if (internalUsers != null)
        {
            return MapperService.Map<List<SystemUser>, List<UserResponse>>(internalUsers);
        }

        return null;
    }

    public async Task<SystemUser> GetUserWithFullInfo(int id)
    {
        var user = await UnitOfWork.SystemUserRepository.GetUserWithFullInfo(id);
        return user;
    }

    public async Task<UserLoginPatchRequest> GetUserLoginPatchRequest(int id)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(id);
        return MapperService.Map<UserLoginPatchRequest>(user);
    }

    public async Task<PatchUserRequest> GetUserPatchRequest(int id)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(id);
        return MapperService.Map<PatchUserRequest>(user);
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object userId)
    {
        var disputeLastModified = await UnitOfWork.SystemUserRepository.GetLastModifiedDate((int)userId);
        return disputeLastModified;
    }

    public async Task<UserLoginResponse> CreateUser(UserLoginRequest request)
    {
        var newUser = MapperService.Map<UserLoginRequest, SystemUser>(request);
        newUser.Password = HashHelper.GetHash(request.Password);
        newUser.UserGuid = Guid.NewGuid();
        var userResult = await UnitOfWork.SystemUserRepository.InsertAsync(newUser);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<SystemUser, UserLoginResponse>(userResult);
        }

        return null;
    }

    public async Task<UserResponse> PatchUserAsync(int userId, PatchUserRequest patchUserRequest)
    {
        try
        {
            var originalUser = await GetSystemUser(userId);
            MapperService.Map(patchUserRequest, originalUser);
            UnitOfWork.SystemUserRepository.Attach(originalUser);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<SystemUser, UserResponse>(originalUser);
            }
        }
        catch (Exception ex)
        {
            Debug.Write(ex.Message);
        }

        return null;
    }

    public async Task<UserLoginResponse> PatchLoginUserAsync(int userId, UserLoginPatchRequest userLoginPatchRequest)
    {
        try
        {
            var originalUser = await GetSystemUser(userId);
            MapperService.Map(userLoginPatchRequest, originalUser);
            UnitOfWork.SystemUserRepository.Attach(originalUser);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<SystemUser, UserLoginResponse>(originalUser);
            }
        }
        catch (Exception ex)
        {
            Debug.Write(ex.Message);
        }

        return null;
    }

    public async Task<bool> Reset(SystemUser user, string value)
    {
        try
        {
            user.Password = HashHelper.GetHash(value);
            UnitOfWork.SystemUserRepository.Attach(user);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }
        catch (Exception ex)
        {
            Debug.Write(ex.Message);
        }

        return false;
    }

    public async Task<string> CheckUserUnique(string accountEmail, string username, int systemUserRoleId)
    {
        var users = await UnitOfWork.SystemUserRepository.GetUsersByRole(systemUserRoleId);
        if (users == null)
        {
            return string.Empty;
        }

        var isEmailExists = users.Exists(x => !string.IsNullOrEmpty(x.AccountEmail) && x.AccountEmail == accountEmail);

        if (isEmailExists)
        {
            var isActive = users.Find(u => u.AccountEmail == accountEmail)?.IsActive;
            if (isActive != null && isActive.Value)
            {
                return ApiReturnMessages.DuplicateEmailForRole;
            }

            return ApiReturnMessages.InactiveEmailExists;
        }

        var isUsernameExists = users.Exists(x => x.Username == username);

        if (isUsernameExists)
        {
            var isActive = users.Find(x => x.Username == username)?.IsActive;
            if (isActive != null && isActive.Value)
            {
                return ApiReturnMessages.DuplicateUsernameForRole;
            }

            return ApiReturnMessages.InactiveUsernameExists;
        }

        return string.Empty;
    }

    public async Task<List<DisputeUserResponse>> GetDisputeUsers(Guid disputeGuid)
    {
        var disputeUsers = await UnitOfWork.DisputeUserRepository.GetDisputeUsers(disputeGuid);
        var disputeUsersResponse = MapperService.Map<List<DisputeUser>, List<DisputeUserResponse>>(disputeUsers);
        return disputeUsersResponse;
    }

    public async Task<bool> UserIsAdmin(int userId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetAdminUser(userId);
        return user != null;
    }

    public async Task<bool> UserExists(int userId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(userId);
        return user != null;
    }

    public async Task<SystemUser> CreateUpdateSmUser(string userName, string email, string displayName, Guid userGuid, int roleId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetUserByUserGuid(userGuid);
        if (user != null)
        {
            user.AccountEmail = email;
            user.FullName = displayName;
            UnitOfWork.SystemUserRepository.Update(user);
            var userUpdateResult = await UnitOfWork.Complete();
            return userUpdateResult.CheckSuccess() ? user : null;
        }

        var newUser = new SystemUser
        {
            Username = userName,
            AccountEmail = email,
            Password = " ",
            FullName = displayName,
            UserGuid = userGuid,
            SystemUserRoleId = roleId,
            Scheduler = false,
            AdminAccess = false,
            CreatedBy = Constants.UndefinedUserId,
            IsActive = roleId != (int)Roles.StaffUser
        };

        var userResult = await UnitOfWork.SystemUserRepository.InsertAsync(newUser);
        var result = await UnitOfWork.Complete();
        return result.CheckSuccess() ? userResult : null;
    }

    public async Task<bool> UserIsActiveAdmin(int userId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetAdminUser(userId);
        if (user is not { IsActive: { } })
        {
            return false;
        }

        return user.IsActive.Value;
    }

    public async Task<bool> UserIsValidScheduler(int userId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(userId);
        if (user is { Scheduler: true })
        {
            return true;
        }

        return false;
    }
}