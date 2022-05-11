using System;
using System.Net;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Theory]
    [InlineData(Users.Admin, Users.Admin, HttpStatusCode.OK)]
    [InlineData(Users.User, Users.User, HttpStatusCode.Unauthorized)]
    [InlineData(Users.User2, Users.User2, HttpStatusCode.Unauthorized)]
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    public void CheckScheduleRequestSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        Client.Authenticate(userName, password);

        var scheduleRequestPostResponse = ScheduleRequestManager.CreateScheduleRequest(Client, new ScheduleRequestPostRequest { RequestStart = DateTime.UtcNow.AddMinutes(5), RequestEnd = DateTime.UtcNow.AddHours(2), RequestDescription = "Desc Test", RequestSubmitter = 1, RequestType = 1 });
        scheduleRequestPostResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleRequestPatchResponse = ScheduleRequestManager.UpdateScheduleRequest(Client, Data.ScheduleRequests[0].ScheduleRequestId, new ScheduleRequestPatchRequest { RequestNote = "Test Note" });
        scheduleRequestPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleRequestGetResponse = ScheduleRequestManager.GetScheduleRequest(Client, Data.ScheduleRequests[4].ScheduleRequestId);
        scheduleRequestGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleRequestResponse = ScheduleRequestManager.GetScheduleRequests(Client, new ScheduleRequestsGetRequest { RequestType = new[] { 1 } });
        scheduleRequestResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleRequestDeleteResponse = ScheduleRequestManager.DeleteRequest(Client, Data.ScheduleRequests[5].ScheduleRequestId);
        scheduleRequestDeleteResponse.StatusCode.Should().Be(httpStatusCode);
    }
}