using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDisputeSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.CheckStatusCode();

        var disputeListResponse = DisputeManager.GetDisputeList(Client);
        disputeListResponse.CheckStatusCode();

        var disputePatchResponse = DisputeManager.UpdateDispute(Client, Data.Dispute.DisputeGuid, new DisputeRequest());
        disputePatchResponse.CheckStatusCode();

        var disputeGetResponse = DisputeManager.GetDispute(Client, Data.Dispute.DisputeGuid);
        disputeGetResponse.CheckStatusCode();

        var disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, Data.Dispute.DisputeGuid, new DisputeStatusPostRequest());
        disputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeStatusGetResponse = DisputeManager.GetDisputeStatus(Client, Data.Dispute.DisputeGuid);
        disputeStatusGetResponse.CheckStatusCode();

        var disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Data.Dispute.DisputeGuid, new List<IntakeQuestionRequest>());
        disputeIntakeQuestionPostResponse.CheckStatusCode();

        var disputeIntakeQuestionPatchResponse = DisputeManager.UpdateIntakeQuestion(Client, Data.IntakeQuestion.IntakeQuestionId);
        disputeIntakeQuestionPatchResponse.CheckStatusCode();

        var disputeIntakeQuestionGetResponse = DisputeManager.GetIntakeQuestion(Client, Data.IntakeQuestion.DisputeGuid);
        disputeIntakeQuestionGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.CheckStatusCode();

        disputeListResponse = DisputeManager.GetDisputeList(Client);
        disputeListResponse.CheckStatusCode();

        disputePatchResponse = DisputeManager.UpdateDispute(Client, Data.Dispute.DisputeGuid, new DisputeRequest());
        disputePatchResponse.CheckStatusCode();

        disputeGetResponse = DisputeManager.GetDispute(Client, Data.Dispute.DisputeGuid);
        disputeGetResponse.CheckStatusCode();

        disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, Data.Dispute.DisputeGuid, new DisputeStatusPostRequest());
        disputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeStatusGetResponse = DisputeManager.GetDisputeStatus(Client, Data.Dispute.DisputeGuid);
        disputeStatusGetResponse.CheckStatusCode();

        disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Data.Dispute.DisputeGuid, new List<IntakeQuestionRequest>());
        disputeIntakeQuestionPostResponse.CheckStatusCode();

        disputeIntakeQuestionPatchResponse = DisputeManager.UpdateIntakeQuestion(Client, Data.IntakeQuestion.IntakeQuestionId);
        disputeIntakeQuestionPatchResponse.CheckStatusCode();

        disputeIntakeQuestionGetResponse = DisputeManager.GetIntakeQuestion(Client, Data.IntakeQuestion.DisputeGuid);
        disputeIntakeQuestionGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        disputePatchResponse = DisputeManager.UpdateDispute(Client, Data.Dispute.DisputeGuid, new DisputeRequest());
        disputePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeGetResponse = DisputeManager.GetDispute(Client, Data.Dispute.DisputeGuid);
        disputeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, Data.Dispute.DisputeGuid, new DisputeStatusPostRequest());
        disputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusGetResponse = DisputeManager.GetDisputeStatus(Client, Data.Dispute.DisputeGuid);
        disputeStatusGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Data.Dispute.DisputeGuid, new List<IntakeQuestionRequest>());
        disputeIntakeQuestionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPatchResponse = DisputeManager.UpdateIntakeQuestion(Client, Data.IntakeQuestion.IntakeQuestionId);
        disputeIntakeQuestionPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionGetResponse = DisputeManager.GetIntakeQuestion(Client, Data.IntakeQuestion.DisputeGuid);
        disputeIntakeQuestionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeListResponse = DisputeManager.GetDisputeList(Client);
        disputeListResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputePatchResponse = DisputeManager.UpdateDispute(Client, Data.Dispute.DisputeGuid, new DisputeRequest());
        disputePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeGetResponse = DisputeManager.GetDispute(Client, Data.Dispute.DisputeGuid);
        disputeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, Data.Dispute.DisputeGuid, new DisputeStatusPostRequest());
        disputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusGetResponse = DisputeManager.GetDisputeStatus(Client, Data.Dispute.DisputeGuid);
        disputeStatusGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Data.Dispute.DisputeGuid, new List<IntakeQuestionRequest>());
        disputeIntakeQuestionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPatchResponse = DisputeManager.UpdateIntakeQuestion(Client, Data.IntakeQuestion.IntakeQuestionId);
        disputeIntakeQuestionPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionGetResponse = DisputeManager.GetIntakeQuestion(Client, Data.IntakeQuestion.DisputeGuid);
        disputeIntakeQuestionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeListResponse = DisputeManager.GetDisputeList(Client);
        disputeListResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputePatchResponse = DisputeManager.UpdateDispute(Client, Data.Dispute.DisputeGuid, new DisputeRequest());
        disputePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeGetResponse = DisputeManager.GetDispute(Client, Data.Dispute.DisputeGuid);
        disputeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, Data.Dispute.DisputeGuid, new DisputeStatusPostRequest());
        disputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusGetResponse = DisputeManager.GetDisputeStatus(Client, Data.Dispute.DisputeGuid);
        disputeStatusGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Data.Dispute.DisputeGuid, new List<IntakeQuestionRequest>());
        disputeIntakeQuestionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionPatchResponse = DisputeManager.UpdateIntakeQuestion(Client, Data.IntakeQuestion.IntakeQuestionId);
        disputeIntakeQuestionPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeIntakeQuestionGetResponse = DisputeManager.GetIntakeQuestion(Client, Data.IntakeQuestion.DisputeGuid);
        disputeIntakeQuestionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}