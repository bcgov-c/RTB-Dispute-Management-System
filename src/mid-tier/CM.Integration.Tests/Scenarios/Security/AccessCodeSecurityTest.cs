using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckAccessCodeSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var accessCodeFileInfoResponse = AccessCodeManager.GetAccessCodeFileInfo(Client);
        accessCodeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        accessCodeFileInfoResponse = AccessCodeManager.GetAccessCodeFileInfo(Client);
        accessCodeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        accessCodeFileInfoResponse = AccessCodeManager.GetAccessCodeFileInfo(Client);
        accessCodeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        accessCodeFileInfoResponse = AccessCodeManager.GetAccessCodeFileInfo(Client);
        accessCodeFileInfoResponse.CheckStatusCode();

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        accessCodeFileInfoResponse = AccessCodeManager.GetAccessCodeFileInfo(Client);
        accessCodeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}