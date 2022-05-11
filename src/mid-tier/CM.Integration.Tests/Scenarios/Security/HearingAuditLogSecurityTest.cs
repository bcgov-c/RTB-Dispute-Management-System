using System.Net;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckHearingAuditLogSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var hearingAuditLogsGetResponse = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = Data.Hearings[0].HearingId });
        hearingAuditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // SCHEDULER ADMIN(STAFF) USERS
        Client.Authenticate(Data.HearingUsers[0].Username, "12345" + Data.HearingUsers[0].Username);

        hearingAuditLogsGetResponse = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = Data.Hearings[0].HearingId });
        hearingAuditLogsGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        hearingAuditLogsGetResponse = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = Data.Hearings[0].HearingId });
        hearingAuditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        hearingAuditLogsGetResponse = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = Data.Hearings[0].HearingId });
        hearingAuditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        hearingAuditLogsGetResponse = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = Data.Hearings[0].HearingId });
        hearingAuditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}