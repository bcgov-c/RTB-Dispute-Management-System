using System.Net;
using CM.Business.Entities.Models.InternalUserProfile;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckInternalUserSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var internalUserPostResponse = InternalUserManager.CreateInternalUser(Client, 1, new InternalUserProfileRequest());
        internalUserPostResponse.CheckStatusCode();

        var internalUser = internalUserPostResponse.ResponseObject;
        var internalUserPatchResponse = InternalUserManager.UpdateInternalUser(Client, internalUser.InternalUserProfileId, new InternalUserProfileRequest());
        internalUserPatchResponse.CheckStatusCode();

        var internalUsersGetResponse = InternalUserManager.GetInternalUsers(Client);
        internalUsersGetResponse.CheckStatusCode();

        var internalUserRolePostResponse = InternalUserManager.CreateInternalUserRole(Client, internalUser.InternalUserProfileId, new InternalUserRoleRequest());
        internalUserRolePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var internalUserRolePatchResponse = InternalUserManager.UpdateInternalUserRole(Client, 1, new InternalUserRoleRequest());
        internalUserRolePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        var token = Client.Authenticate(Users.User, Users.User);
        Assert.NotNull(token);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        token = Client.Authenticate(Users.User2, Users.User2);
        Assert.NotNull(token);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        // LOGIN AS OFFICE PAY
        token = Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);
        Assert.NotNull(token);
    }
}