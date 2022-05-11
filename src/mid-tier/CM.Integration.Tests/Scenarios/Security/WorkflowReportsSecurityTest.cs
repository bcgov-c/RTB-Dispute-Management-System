using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckWorkflowReportsSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);
        var outcomeDocDeliveryPostResponse = WorkflowReportsManager.GetWorkflowReports(Client, Data.OutcomeDocDeliveries[1].DisputeGuid);
        outcomeDocDeliveryPostResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);
        outcomeDocDeliveryPostResponse = WorkflowReportsManager.GetWorkflowReports(Client, Data.OutcomeDocDeliveries[1].DisputeGuid);
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);
        outcomeDocDeliveryPostResponse = WorkflowReportsManager.GetWorkflowReports(Client, Data.OutcomeDocDeliveries[1].DisputeGuid);
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);
        outcomeDocDeliveryPostResponse = WorkflowReportsManager.GetWorkflowReports(Client, Data.OutcomeDocDeliveries[1].DisputeGuid);
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}