using System.Net;
using CM.Business.Entities.Models.Dashboard;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDashboardSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var assignedHearingsResponse = DashboardManager.GetAssignedHearings(Client, 1, new AssignedHearingsRequest());
        assignedHearingsResponse.CheckStatusCode();

        var unAssignedHearingsResponse = DashboardManager.GetUnAssignedHearings(Client, new UnAssignedHearingsRequest());
        unAssignedHearingsResponse.CheckStatusCode();

        var assignedDisputesResponse = DashboardManager.GetAssignedDisputes(Client, 1, new DashboardSearchDisputesRequest());
        assignedDisputesResponse.CheckStatusCode();

        var unAssignedDisputesResponse = DashboardManager.GetUnAssignedDisputes(Client, new DashboardSearchDisputesRequest());
        unAssignedDisputesResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        assignedHearingsResponse = DashboardManager.GetAssignedHearings(Client, 1, new AssignedHearingsRequest());
        assignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedHearingsResponse = DashboardManager.GetUnAssignedHearings(Client, new UnAssignedHearingsRequest());
        unAssignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        assignedDisputesResponse = DashboardManager.GetAssignedDisputes(Client, 1, new DashboardSearchDisputesRequest());
        assignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedDisputesResponse = DashboardManager.GetUnAssignedDisputes(Client, new DashboardSearchDisputesRequest());
        unAssignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        assignedHearingsResponse = DashboardManager.GetAssignedHearings(Client, 1, new AssignedHearingsRequest());
        assignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedHearingsResponse = DashboardManager.GetUnAssignedHearings(Client, new UnAssignedHearingsRequest());
        unAssignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        assignedDisputesResponse = DashboardManager.GetAssignedDisputes(Client, 1, new DashboardSearchDisputesRequest());
        assignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedDisputesResponse = DashboardManager.GetUnAssignedDisputes(Client, new DashboardSearchDisputesRequest());
        unAssignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        assignedHearingsResponse = DashboardManager.GetAssignedHearings(Client, 1, new AssignedHearingsRequest());
        assignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedHearingsResponse = DashboardManager.GetUnAssignedHearings(Client, new UnAssignedHearingsRequest());
        unAssignedHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        assignedDisputesResponse = DashboardManager.GetAssignedDisputes(Client, 1, new DashboardSearchDisputesRequest());
        assignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unAssignedDisputesResponse = DashboardManager.GetUnAssignedDisputes(Client, new DashboardSearchDisputesRequest());
        unAssignedDisputesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}