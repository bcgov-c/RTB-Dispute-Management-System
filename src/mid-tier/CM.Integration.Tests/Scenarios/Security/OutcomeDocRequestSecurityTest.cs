using System;
using System.Net;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Common.Utilities;
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
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    [InlineData(null, null, HttpStatusCode.Unauthorized)]
    public void CheckOutcomeDocRequestSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        if (userName == null)
        {
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);
        }
        else
        {
            Client.Authenticate(userName, password);
        }

        var outcomeDocRequestPostResponse = OutcomeDocRequestManager.CreateOutcomeDocRequest(Client, Data.Dispute.DisputeGuid, new OutcomeDocRequestRequest { RequestType = OutcomeDocRequestType.Correction, DateDocumentsReceived = DateTime.UtcNow.AddDays(-1), SubmitterId = 1 });
        outcomeDocRequestPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocRequestPatchResponse = OutcomeDocRequestManager.UpdateOutcomeDocRequest(Client, Data.OutcomeDocRequests[1].OutcomeDocRequestId, new OutcomeDocRequestPatchRequest { AffectedDocuments = OutcomeDocAffectedDocuments.MonetaryOrderOnly });
        outcomeDocRequestPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var outcomeDocRequestDeleteResponse = OutcomeDocRequestManager.DeleteOutcomeDocRequest(Client, Data.OutcomeDocRequests[5].OutcomeDocRequestId);
        outcomeDocRequestDeleteResponse.StatusCode.Should().Be(httpStatusCode);

        var outcomeDocRequestGetResponse = OutcomeDocRequestManager.GetOutcomeDocRequest(Client, Data.OutcomeDocRequests[1].OutcomeDocRequestId);
        outcomeDocRequestGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var outcomeDocRequestGetAllResponse = OutcomeDocRequestManager.GetDisputeOutcomeDocRequests(Client, Data.Dispute.DisputeGuid);
        outcomeDocRequestGetAllResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);
    }
}