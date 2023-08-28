using System.Net;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.OfficeUser;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckExternalUpdateSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var partyPatchResponse = ExternalUpdateManager.UpdateParticipant(Client, Data.Participants[0].ParticipantId, new ExternalUpdateParticipantRequest());
        partyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var noticePatchResponse = ExternalUpdateManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new ExternalUpdateNoticeServiceRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var disputeStatusPatchResponse = ExternalUpdateManager.CreateDisputeStatus(Client, 123456, new ExternalUpdateDisputeStatusRequest());
        disputeStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var disputeDetailsGetResponse = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest());
        disputeDetailsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputePostResponse = ExternalUpdateManager.CreateDispute(Client, new OfficeUserPostDisputeRequest());
        disputePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var paymentTransactionPostResponse = ExternalUpdateManager.CreatePaymentTransaction(Client, Data.DisputeFees[0].DisputeFeeId, new OfficeUserPostTransactionRequest());
        paymentTransactionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeInfoPatchResponse = ExternalUpdateManager.UpdateDisputeInfo(Client, Data.Dispute.DisputeGuid, new OfficeUserPatchDisputeRequest());
        disputeInfoPatchResponse.CheckStatusCode();

        var noticePostResponse = ExternalUpdateManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new OfficeUserPostNoticeRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearingWaitTimeGetResponse = ExternalUpdateManager.GetHearingWaitTime(Client, new ExternalHearingWaitTimeRequest());
        hearingWaitTimeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        partyPatchResponse = ExternalUpdateManager.UpdateParticipant(Client, Data.Participants[0].ParticipantId, new ExternalUpdateParticipantRequest());
        partyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticePatchResponse = ExternalUpdateManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new ExternalUpdateNoticeServiceRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusPatchResponse = ExternalUpdateManager.CreateDisputeStatus(Client, 123456, new ExternalUpdateDisputeStatusRequest());
        disputeStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeDetailsGetResponse = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest());
        disputeDetailsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputePostResponse = ExternalUpdateManager.CreateDispute(Client, new OfficeUserPostDisputeRequest());
        disputePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentTransactionPostResponse = ExternalUpdateManager.CreatePaymentTransaction(Client, Data.DisputeFees[0].DisputeFeeId, new OfficeUserPostTransactionRequest());
        paymentTransactionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeInfoPatchResponse = ExternalUpdateManager.UpdateDisputeInfo(Client, Data.Dispute.DisputeGuid, new OfficeUserPatchDisputeRequest());
        disputeInfoPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticePostResponse = ExternalUpdateManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new OfficeUserPostNoticeRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingWaitTimeGetResponse = ExternalUpdateManager.GetHearingWaitTime(Client, new ExternalHearingWaitTimeRequest());
        hearingWaitTimeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        partyPatchResponse = ExternalUpdateManager.UpdateParticipant(Client, Data.Participants[0].ParticipantId, new ExternalUpdateParticipantRequest());
        partyPatchResponse.CheckStatusCode();

        noticePatchResponse = ExternalUpdateManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new ExternalUpdateNoticeServiceRequest());
        noticePatchResponse.CheckStatusCode();

        disputeStatusPatchResponse = ExternalUpdateManager.CreateDisputeStatus(Client, Data.Dispute.FileNumber.GetValueOrDefault(), new ExternalUpdateDisputeStatusRequest());
        disputeStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeDetailsGetResponse = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest());
        disputeDetailsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputePostResponse = ExternalUpdateManager.CreateDispute(Client, new OfficeUserPostDisputeRequest());
        disputePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentTransactionPostResponse = ExternalUpdateManager.CreatePaymentTransaction(Client, Data.DisputeFees[0].DisputeFeeId, new OfficeUserPostTransactionRequest());
        paymentTransactionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeInfoPatchResponse = ExternalUpdateManager.UpdateDisputeInfo(Client, Data.Dispute.DisputeGuid, new OfficeUserPatchDisputeRequest());
        disputeInfoPatchResponse.CheckStatusCode();

        noticePostResponse = ExternalUpdateManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new OfficeUserPostNoticeRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        hearingWaitTimeGetResponse = ExternalUpdateManager.GetHearingWaitTime(Client, new ExternalHearingWaitTimeRequest());
        hearingWaitTimeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        partyPatchResponse = ExternalUpdateManager.UpdateParticipant(Client, Data.Participants[0].ParticipantId, new ExternalUpdateParticipantRequest());
        partyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        noticePatchResponse = ExternalUpdateManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new ExternalUpdateNoticeServiceRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeStatusPatchResponse = ExternalUpdateManager.CreateDisputeStatus(Client, 123456, new ExternalUpdateDisputeStatusRequest());
        disputeStatusPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.NotFound);

        disputeDetailsGetResponse = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest());
        disputeDetailsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputePostResponse = ExternalUpdateManager.CreateDispute(Client, new OfficeUserPostDisputeRequest());
        disputePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        paymentTransactionPostResponse = ExternalUpdateManager.CreatePaymentTransaction(Client, Data.DisputeFees[0].DisputeFeeId, new OfficeUserPostTransactionRequest());
        paymentTransactionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeInfoPatchResponse = ExternalUpdateManager.UpdateDisputeInfo(Client, Data.Dispute.DisputeGuid, new OfficeUserPatchDisputeRequest());
        disputeInfoPatchResponse.CheckStatusCode();

        noticePostResponse = ExternalUpdateManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new OfficeUserPostNoticeRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        hearingWaitTimeGetResponse = ExternalUpdateManager.GetHearingWaitTime(Client, new ExternalHearingWaitTimeRequest());
        hearingWaitTimeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }
}