using System.Net;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckSubmissionReceiptSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, Data.Dispute.DisputeGuid, new SubmissionReceiptPostRequest());
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var submissionReceiptPatchResponse = SubmissionReceiptManager.UpdateSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId, new SubmissionReceiptPatchRequest());
        submissionReceiptPatchResponse.CheckStatusCode();

        var submissionReceiptDeleteResponse = SubmissionReceiptManager.DeleteSubmissionReceipt(Client, Data.SubmissionReceipts[1].SubmissionReceiptId);
        submissionReceiptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var submissionReceiptGetResponse = SubmissionReceiptManager.GetSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId);
        submissionReceiptGetResponse.CheckStatusCode();

        var submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, Data.Dispute.DisputeGuid);
        submissionReceiptsGetResponse.CheckStatusCode();

        var externalSubmissionReceiptsGetResponse = SubmissionReceiptManager.GetExternalSubmissionReceipts(Client, Data.Dispute.DisputeGuid, new ExternalSubmissionReceiptRequest() { Participants = new int[] { Data.Participants[0].ParticipantId } });
        externalSubmissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, Data.Dispute.DisputeGuid, new SubmissionReceiptPostRequest());
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        submissionReceiptPatchResponse = SubmissionReceiptManager.UpdateSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId, new SubmissionReceiptPatchRequest());
        submissionReceiptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptDeleteResponse = SubmissionReceiptManager.DeleteSubmissionReceipt(Client, Data.SubmissionReceipts[1].SubmissionReceiptId);
        submissionReceiptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptGetResponse = SubmissionReceiptManager.GetSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId);
        submissionReceiptGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, Data.Dispute.DisputeGuid);
        submissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalSubmissionReceiptsGetResponse = SubmissionReceiptManager.GetExternalSubmissionReceipts(Client, Data.Dispute.DisputeGuid, new ExternalSubmissionReceiptRequest() { Participants = new int[] { Data.Participants[0].ParticipantId } });
        externalSubmissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, Data.Dispute.DisputeGuid, new SubmissionReceiptPostRequest());
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        submissionReceiptPatchResponse = SubmissionReceiptManager.UpdateSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId, new SubmissionReceiptPatchRequest());
        submissionReceiptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptDeleteResponse = SubmissionReceiptManager.DeleteSubmissionReceipt(Client, Data.SubmissionReceipts[1].SubmissionReceiptId);
        submissionReceiptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptGetResponse = SubmissionReceiptManager.GetSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId);
        submissionReceiptGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, Data.Dispute.DisputeGuid);
        submissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalSubmissionReceiptsGetResponse = SubmissionReceiptManager.GetExternalSubmissionReceipts(Client, Data.Dispute.DisputeGuid, new ExternalSubmissionReceiptRequest() { Participants = new int[] { Data.Participants[0].ParticipantId } });
        externalSubmissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, Data.Dispute.DisputeGuid, new SubmissionReceiptPostRequest());
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        submissionReceiptPatchResponse = SubmissionReceiptManager.UpdateSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId, new SubmissionReceiptPatchRequest());
        submissionReceiptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptDeleteResponse = SubmissionReceiptManager.DeleteSubmissionReceipt(Client, Data.SubmissionReceipts[1].SubmissionReceiptId);
        submissionReceiptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptGetResponse = SubmissionReceiptManager.GetSubmissionReceipt(Client, Data.SubmissionReceipts[0].SubmissionReceiptId);
        submissionReceiptGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, Data.Dispute.DisputeGuid);
        submissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalSubmissionReceiptsGetResponse = SubmissionReceiptManager.GetExternalSubmissionReceipts(Client, Data.Dispute.DisputeGuid, new ExternalSubmissionReceiptRequest() { Participants = new int[] { Data.Participants[0].ParticipantId } });
        externalSubmissionReceiptsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}