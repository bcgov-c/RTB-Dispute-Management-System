using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckAuditLogSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var auditLogGetResponse = AuditLogManager.GetAuditLog(Client, -1);
        auditLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var auditLogsGetResponse = AuditLogManager.GetAuditLogs(Client, Data.Dispute.DisputeGuid);
        auditLogsGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        auditLogGetResponse = AuditLogManager.GetAuditLog(Client, 1);
        auditLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        auditLogsGetResponse = AuditLogManager.GetAuditLogs(Client, Data.Dispute.DisputeGuid);
        auditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        auditLogGetResponse = AuditLogManager.GetAuditLog(Client, 1);
        auditLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        auditLogsGetResponse = AuditLogManager.GetAuditLogs(Client, Data.Dispute.DisputeGuid);
        auditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        auditLogGetResponse = AuditLogManager.GetAuditLog(Client, 1);
        auditLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        auditLogsGetResponse = AuditLogManager.GetAuditLogs(Client, Data.Dispute.DisputeGuid);
        auditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        auditLogGetResponse = AuditLogManager.GetAuditLog(Client, 1);
        auditLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        auditLogsGetResponse = AuditLogManager.GetAuditLogs(Client, Data.Dispute.DisputeGuid);
        auditLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}