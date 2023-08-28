using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.User;
using CM.Data.Model;

namespace CM.Business.Services.UserServices;

public interface IUserService : IServiceBase
{
    Task<SystemUser> GetUserWithFullInfo(int id);

    Task<UserResponse> GetUser(int id);

    Task<List<UserResponse>> GetInternalUsers();

    Task<SystemUser> GetSystemUser(int id);

    Task<PatchUserRequest> GetUserPatchRequest(int id);

    Task<UserLoginPatchRequest> GetUserLoginPatchRequest(int id);

    Task<UserLoginResponse> CreateUser(UserLoginRequest request);

    Task<UserResponse> PatchUserAsync(int userId, PatchUserRequest patchUserRequest);

    Task<UserLoginResponse> PatchLoginUserAsync(int userId, UserLoginPatchRequest userLoginPatchRequest);

    Task<bool> Reset(SystemUser user, string value);

    Task<string> CheckUserUnique(string accountEmail, string username, int systemUserRoleId);

    Task<List<DisputeUserResponse>> GetDisputeUsers(Guid disputeGuid);

    Task<bool> UserIsAdmin(int userId);

    Task<bool> UserExists(int userId);

    Task<SystemUser> CreateUpdateSmUser(string username, string email, string displayName, Guid userGuid, int roleId);

    Task<bool> UserIsActiveAdmin(int systemUserId);

    Task<List<RecentLoginsResponse>> GetRecentLogins(int userId);
}