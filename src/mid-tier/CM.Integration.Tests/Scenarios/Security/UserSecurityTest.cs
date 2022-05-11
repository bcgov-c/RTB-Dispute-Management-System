using System.Net;
using CM.Business.Entities.Models.User;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckUserSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var userInfoGetResponse = UserManager.GetUserInfo(Client);
        userInfoGetResponse.CheckStatusCode();

        var userInternalUsersGetResponse = UserManager.GetInternalUsers(Client);
        userInternalUsersGetResponse.CheckStatusCode();

        var userInternalUserStatusPatchResponse = UserManager.UpdateInternalUserStatus(Client, 1, new PatchUserRequest { IsActive = true });
        userInternalUserStatusPatchResponse.CheckStatusCode();

        var userSessionInfoGetResponse = UserManager.GetSessionInfo(Client);
        userSessionInfoGetResponse.CheckStatusCode();

        var userExtendSessionPostResponse = UserManager.ExtendSession(Client);
        userExtendSessionPostResponse.CheckStatusCode();

        var userDisputeUsersGetResponse = UserManager.GetDisputeUsers(Client, Data.Dispute.DisputeGuid);
        userDisputeUsersGetResponse.CheckStatusCode();

        var userRequest = new UserLoginRequest { AcceptsTextMessages = true, AdminAccess = true, Username = "newUser", Password = "newUser-123456", Scheduler = false, SystemUserRoleId = 1, IsActive = true };
        var userCreateResponse = UserManager.CreateUser(Client, userRequest);
        userCreateResponse.CheckStatusCode();

        var userLogoutResponse = UserManager.Logout(Client);
        userLogoutResponse.Should().Be(HttpStatusCode.NoContent);

        Client.Authenticate(userRequest.Username, userRequest.Password);

        var userUpdateResponse = UserManager.UpdateUser(Client, userCreateResponse.ResponseObject.SystemUserId, new UserLoginPatchRequest { AccountMobile = "123456789" });
        userUpdateResponse.CheckStatusCode();

        var userResetResponse = UserManager.ResetUser(Client, userCreateResponse.ResponseObject.SystemUserId, new UserLoginResetRequest { Password = "change_newUser-123456" });
        userResetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        userInfoGetResponse = UserManager.GetUserInfo(Client);
        userInfoGetResponse.CheckStatusCode();

        userInternalUsersGetResponse = UserManager.GetInternalUsers(Client);
        userInternalUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userInternalUserStatusPatchResponse = UserManager.UpdateInternalUserStatus(Client, 1, new PatchUserRequest { IsActive = true });
        userInternalUserStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userSessionInfoGetResponse = UserManager.GetSessionInfo(Client);
        userSessionInfoGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userExtendSessionPostResponse = UserManager.ExtendSession(Client);
        userExtendSessionPostResponse.CheckStatusCode();

        userDisputeUsersGetResponse = UserManager.GetDisputeUsers(Client, Data.Dispute.DisputeGuid);
        userDisputeUsersGetResponse.CheckStatusCode();

        userCreateResponse = UserManager.CreateUser(Client, new UserLoginRequest { AcceptsTextMessages = true, AdminAccess = true, Username = "newUser", Password = "newUser-123456", Scheduler = false, SystemUserRoleId = 1 });
        userCreateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userUpdateResponse = UserManager.UpdateUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginPatchRequest { AccountMobile = "123456789" });
        userUpdateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userResetResponse = UserManager.ResetUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginResetRequest { Password = "change_newUser-123456" });
        userResetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userLogoutResponse = UserManager.Logout(Client);
        userLogoutResponse.Should().Be(HttpStatusCode.NoContent);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        userDisputeUsersGetResponse = UserManager.GetDisputeUsers(Client, Data.Dispute.DisputeGuid);
        userDisputeUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        userInfoGetResponse = UserManager.GetUserInfo(Client);
        userInfoGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userInternalUsersGetResponse = UserManager.GetInternalUsers(Client);
        userInternalUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userInternalUserStatusPatchResponse = UserManager.UpdateInternalUserStatus(Client, 1, new PatchUserRequest { IsActive = true });
        userInternalUserStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userSessionInfoGetResponse = UserManager.GetSessionInfo(Client);
        userSessionInfoGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userExtendSessionPostResponse = UserManager.ExtendSession(Client);
        userExtendSessionPostResponse.CheckStatusCode();

        userDisputeUsersGetResponse = UserManager.GetDisputeUsers(Client, Data.Dispute.DisputeGuid);
        userDisputeUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userCreateResponse = UserManager.CreateUser(Client, new UserLoginRequest { AcceptsTextMessages = true, AdminAccess = true, Username = "newUser", Password = "newUser-123456", Scheduler = false, SystemUserRoleId = 1 });
        userCreateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userUpdateResponse = UserManager.UpdateUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginPatchRequest { AccountMobile = "123456789" });
        userUpdateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userResetResponse = UserManager.ResetUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginResetRequest { Password = "change_newUser-123456" });
        userResetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userLogoutResponse = UserManager.Logout(Client);
        userLogoutResponse.Should().Be(HttpStatusCode.NoContent);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        userInfoGetResponse = UserManager.GetUserInfo(Client);
        userInfoGetResponse.CheckStatusCode();

        userInternalUsersGetResponse = UserManager.GetInternalUsers(Client);
        userInternalUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userInternalUserStatusPatchResponse = UserManager.UpdateInternalUserStatus(Client, 1, new PatchUserRequest { IsActive = true });
        userInternalUserStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userSessionInfoGetResponse = UserManager.GetSessionInfo(Client);
        userSessionInfoGetResponse.CheckStatusCode();

        userExtendSessionPostResponse = UserManager.ExtendSession(Client);
        userExtendSessionPostResponse.CheckStatusCode();

        userDisputeUsersGetResponse = UserManager.GetDisputeUsers(Client, Data.Dispute.DisputeGuid);
        userDisputeUsersGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userCreateResponse = UserManager.CreateUser(Client, new UserLoginRequest { AcceptsTextMessages = true, AdminAccess = true, Username = "newUser", Password = "newUser-123456", Scheduler = false, SystemUserRoleId = 1 });
        userCreateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userUpdateResponse = UserManager.UpdateUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginPatchRequest { AccountMobile = "123456789" });
        userUpdateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        userResetResponse = UserManager.ResetUser(Client, Data.HearingUsers[5].SystemUserId, new UserLoginResetRequest { Password = "change_newUser-123456" });
        userResetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}