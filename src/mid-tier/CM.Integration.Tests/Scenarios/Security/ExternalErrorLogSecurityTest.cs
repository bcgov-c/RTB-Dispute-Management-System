using System;
using System.Net;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckExternalErrorLogSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var externalErrorLogPostResponse = ExternalErrorLogManager.CreateExternalErrorLog(Client, new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogPostResponse.CheckStatusCode();

            var externalErrorLogSessionPostResponse = ExternalErrorLogManager.CreateExternalErrorLogBySession(Client, Guid.NewGuid().ToString(), new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogSessionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            var externalErrorLogPatchResponse = ExternalErrorLogManager.UpdateExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId, new ExternalErrorLogPatchRequest() { ErrorUrgency = 2 });
            externalErrorLogPatchResponse.CheckStatusCode();

            var externalErrorLogDeleteResponse = ExternalErrorLogManager.DeleteExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId);
            externalErrorLogDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var externalErrorLogGetResponse = ExternalErrorLogManager.GetExternalErrorLog(Client, Data.ExternalErrorLogs[5].ExternalErrorLogId);
            externalErrorLogGetResponse.CheckStatusCode();

            var externalErrorLogsGetResponse = ExternalErrorLogManager.GetExternalErrorLogs(Client, new ExternalErrorLogGetRequest() { ErrorOwner = 1 });
            externalErrorLogsGetResponse.CheckStatusCode();

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            externalErrorLogPostResponse = ExternalErrorLogManager.CreateExternalErrorLog(Client, new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogPostResponse.CheckStatusCode();

            externalErrorLogSessionPostResponse = ExternalErrorLogManager.CreateExternalErrorLogBySession(Client, Guid.NewGuid().ToString(), new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogSessionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogPatchResponse = ExternalErrorLogManager.UpdateExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId, new ExternalErrorLogPatchRequest() { ErrorUrgency = 2 });
            externalErrorLogPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogDeleteResponse = ExternalErrorLogManager.DeleteExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId);
            externalErrorLogDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogGetResponse = ExternalErrorLogManager.GetExternalErrorLog(Client, Data.ExternalErrorLogs[5].ExternalErrorLogId);
            externalErrorLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogsGetResponse = ExternalErrorLogManager.GetExternalErrorLogs(Client, new ExternalErrorLogGetRequest() { ErrorOwner = 1 });
            externalErrorLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            externalErrorLogPostResponse = ExternalErrorLogManager.CreateExternalErrorLog(Client, new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogPostResponse.CheckStatusCode();

            externalErrorLogSessionPostResponse = ExternalErrorLogManager.CreateExternalErrorLogBySession(Client, Guid.NewGuid().ToString(), new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogSessionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogPatchResponse = ExternalErrorLogManager.UpdateExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId, new ExternalErrorLogPatchRequest() { ErrorUrgency = 2 });
            externalErrorLogPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogDeleteResponse = ExternalErrorLogManager.DeleteExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId);
            externalErrorLogDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogGetResponse = ExternalErrorLogManager.GetExternalErrorLog(Client, Data.ExternalErrorLogs[5].ExternalErrorLogId);
            externalErrorLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogsGetResponse = ExternalErrorLogManager.GetExternalErrorLogs(Client, new ExternalErrorLogGetRequest() { ErrorOwner = 1 });
            externalErrorLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            externalErrorLogPostResponse = ExternalErrorLogManager.CreateExternalErrorLog(Client, new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogPostResponse.CheckStatusCode();

            externalErrorLogSessionPostResponse = ExternalErrorLogManager.CreateExternalErrorLogBySession(Client, Guid.NewGuid().ToString(), new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle", ErrorDetails = "ErrorDetails 0123456789 0123456789" });
            externalErrorLogSessionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogPatchResponse = ExternalErrorLogManager.UpdateExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId, new ExternalErrorLogPatchRequest() { ErrorUrgency = 2 });
            externalErrorLogPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogDeleteResponse = ExternalErrorLogManager.DeleteExternalErrorLog(Client, Data.ExternalErrorLogs[0].ExternalErrorLogId);
            externalErrorLogDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogGetResponse = ExternalErrorLogManager.GetExternalErrorLog(Client, Data.ExternalErrorLogs[5].ExternalErrorLogId);
            externalErrorLogGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            externalErrorLogsGetResponse = ExternalErrorLogManager.GetExternalErrorLogs(Client, new ExternalErrorLogGetRequest() { ErrorOwner = 1 });
            externalErrorLogsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
