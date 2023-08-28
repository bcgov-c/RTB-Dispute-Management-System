using System.Net;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckDisputeVerificationSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var disputeVerificationPostResponse = DisputeVerificationManager.CreateDisputeVerification(Client, Data.Disputes[0].DisputeGuid, new DisputeVerificationPostRequest()
            {
                DisputeFeeId = Data.DisputeFees[0].DisputeFeeId,
                HearingId = Data.Hearings[0].HearingId
            });
            disputeVerificationPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeVerificationPatchResponse = DisputeVerificationManager.UpdateDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId, new DisputeVerificationPatchRequest { RefundNote = "Test" });
            disputeVerificationPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeVerificationDeleteResponse = DisputeVerificationManager.DeleteDisputeVerification(Client, Data.DisputeVerifications[1].VerificationId);
            disputeVerificationDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeVerificationGetResponse = DisputeVerificationManager.GetDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId);
            disputeVerificationGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeVerificationsGetResponse = DisputeVerificationManager.GetDisputeVerifications(Client, Data.Dispute.DisputeGuid);
            disputeVerificationsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var verificationAttemptPostResponse = DisputeVerificationManager.CreateVerificationAttempt(Client, Data.DisputeVerifications[0].VerificationId, new VerificationAttemptPostRequest
            {
                ParticipantId = Data.Participant.ParticipantId,
                ParticipantRole = ParticipantRole.Applicant
            });
            verificationAttemptPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var verificationAttemptPatchResponse = DisputeVerificationManager.UpdateVerificationAttempt(Client, Data.VerificationAttempts[0].VerificationAttemptId, new VerificationAttemptPatchRequest { AttemptMethod = AttemptMethod.Phone });
            verificationAttemptPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var verificationAttemptDeleteResponse = DisputeVerificationManager.DeleteVerificationAttempt(Client, Data.VerificationAttempts[1].VerificationAttemptId);
            verificationAttemptDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            disputeVerificationPostResponse = DisputeVerificationManager.CreateDisputeVerification(Client, Data.Disputes[0].DisputeGuid, new DisputeVerificationPostRequest()
            {
                DisputeFeeId = Data.DisputeFees[0].DisputeFeeId,
                HearingId = Data.Hearings[0].HearingId
            });
            disputeVerificationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationPatchResponse = DisputeVerificationManager.UpdateDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId, new DisputeVerificationPatchRequest { RefundNote = "Test" });
            disputeVerificationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationDeleteResponse = DisputeVerificationManager.DeleteDisputeVerification(Client, Data.DisputeVerifications[1].VerificationId);
            disputeVerificationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationGetResponse = DisputeVerificationManager.GetDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId);
            disputeVerificationGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationsGetResponse = DisputeVerificationManager.GetDisputeVerifications(Client, Data.Dispute.DisputeGuid);
            disputeVerificationsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPostResponse = DisputeVerificationManager.CreateVerificationAttempt(Client, Data.DisputeVerifications[0].VerificationId, new VerificationAttemptPostRequest
            {
                ParticipantId = Data.Participant.ParticipantId,
                ParticipantRole = ParticipantRole.Applicant
            });
            verificationAttemptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPatchResponse = DisputeVerificationManager.UpdateVerificationAttempt(Client, Data.VerificationAttempts[0].VerificationAttemptId, new VerificationAttemptPatchRequest { AttemptMethod = AttemptMethod.Phone });
            verificationAttemptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptDeleteResponse = DisputeVerificationManager.DeleteVerificationAttempt(Client, Data.VerificationAttempts[1].VerificationAttemptId);
            verificationAttemptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            disputeVerificationPostResponse = DisputeVerificationManager.CreateDisputeVerification(Client, Data.Disputes[0].DisputeGuid, new DisputeVerificationPostRequest()
            {
                DisputeFeeId = Data.DisputeFees[0].DisputeFeeId,
                HearingId = Data.Hearings[0].HearingId
            });
            disputeVerificationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationPatchResponse = DisputeVerificationManager.UpdateDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId, new DisputeVerificationPatchRequest { RefundNote = "Test" });
            disputeVerificationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationDeleteResponse = DisputeVerificationManager.DeleteDisputeVerification(Client, Data.DisputeVerifications[1].VerificationId);
            disputeVerificationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationGetResponse = DisputeVerificationManager.GetDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId);
            disputeVerificationGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationsGetResponse = DisputeVerificationManager.GetDisputeVerifications(Client, Data.Dispute.DisputeGuid);
            disputeVerificationsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPostResponse = DisputeVerificationManager.CreateVerificationAttempt(Client, Data.DisputeVerifications[0].VerificationId, new VerificationAttemptPostRequest
            {
                ParticipantId = Data.Participant.ParticipantId,
                ParticipantRole = ParticipantRole.Applicant
            });
            verificationAttemptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPatchResponse = DisputeVerificationManager.UpdateVerificationAttempt(Client, Data.VerificationAttempts[0].VerificationAttemptId, new VerificationAttemptPatchRequest { AttemptMethod = AttemptMethod.Phone });
            verificationAttemptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptDeleteResponse = DisputeVerificationManager.DeleteVerificationAttempt(Client, Data.VerificationAttempts[1].VerificationAttemptId);
            verificationAttemptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            disputeVerificationPostResponse = DisputeVerificationManager.CreateDisputeVerification(Client, Data.Disputes[0].DisputeGuid, new DisputeVerificationPostRequest()
            {
                DisputeFeeId = Data.DisputeFees[0].DisputeFeeId,
                HearingId = Data.Hearings[0].HearingId
            });
            disputeVerificationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationPatchResponse = DisputeVerificationManager.UpdateDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId, new DisputeVerificationPatchRequest { RefundNote = "Test" });
            disputeVerificationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationDeleteResponse = DisputeVerificationManager.DeleteDisputeVerification(Client, Data.DisputeVerifications[1].VerificationId);
            disputeVerificationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationGetResponse = DisputeVerificationManager.GetDisputeVerification(Client, Data.DisputeVerifications[0].VerificationId);
            disputeVerificationGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeVerificationsGetResponse = DisputeVerificationManager.GetDisputeVerifications(Client, Data.Dispute.DisputeGuid);
            disputeVerificationsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPostResponse = DisputeVerificationManager.CreateVerificationAttempt(Client, Data.DisputeVerifications[0].VerificationId, new VerificationAttemptPostRequest
            {
                ParticipantId = Data.Participant.ParticipantId,
                ParticipantRole = ParticipantRole.Applicant
            });
            verificationAttemptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptPatchResponse = DisputeVerificationManager.UpdateVerificationAttempt(Client, Data.VerificationAttempts[0].VerificationAttemptId, new VerificationAttemptPatchRequest { AttemptMethod = AttemptMethod.Phone });
            verificationAttemptPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            verificationAttemptDeleteResponse = DisputeVerificationManager.DeleteVerificationAttempt(Client, Data.VerificationAttempts[1].VerificationAttemptId);
            verificationAttemptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
