using System.Net;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckParticipantIdentitySecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var participantIdentityPostResponse = ParticipantIdentityManager.CreateParticipantIdentity(Client, new ParticipantIdentityPostRequest());
            participantIdentityPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var participantIdentityPatchResponse = ParticipantIdentityManager.UpdateParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId, new ParticipantIdentityPatchRequest() { IdentityStatus = 4 });
            participantIdentityPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var participantIdentityDeleteResponse = ParticipantIdentityManager.DeleteParticipantIdentity(Client, Data.ParticipantIdentities[1].ParticipantIdentityId);
            participantIdentityDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var participantIdentityGetResponse = ParticipantIdentityManager.GetParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId);
            participantIdentityGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var participantIdentitiesByDisputeResponse = ParticipantIdentityManager.GetIdentitiesByDispute(Client, Data.Dispute.DisputeGuid);
            participantIdentitiesByDisputeResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var participantIdentitiesByParticipantResponse = ParticipantIdentityManager.GetIdentitiesByParticipant(Client, Data.Participant.ParticipantId);
            participantIdentitiesByParticipantResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            participantIdentityPostResponse = ParticipantIdentityManager.CreateParticipantIdentity(Client, new ParticipantIdentityPostRequest());
            participantIdentityPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityPatchResponse = ParticipantIdentityManager.UpdateParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId, new ParticipantIdentityPatchRequest() { IdentityStatus = 4 });
            participantIdentityPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityDeleteResponse = ParticipantIdentityManager.DeleteParticipantIdentity(Client, Data.ParticipantIdentities[1].ParticipantIdentityId);
            participantIdentityDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityGetResponse = ParticipantIdentityManager.GetParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId);
            participantIdentityGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByDisputeResponse = ParticipantIdentityManager.GetIdentitiesByDispute(Client, Data.Dispute.DisputeGuid);
            participantIdentitiesByDisputeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByParticipantResponse = ParticipantIdentityManager.GetIdentitiesByParticipant(Client, Data.Participant.ParticipantId);
            participantIdentitiesByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            participantIdentityPostResponse = ParticipantIdentityManager.CreateParticipantIdentity(Client, new ParticipantIdentityPostRequest());
            participantIdentityPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityPatchResponse = ParticipantIdentityManager.UpdateParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId, new ParticipantIdentityPatchRequest() { IdentityStatus = 4 });
            participantIdentityPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityDeleteResponse = ParticipantIdentityManager.DeleteParticipantIdentity(Client, Data.ParticipantIdentities[1].ParticipantIdentityId);
            participantIdentityDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityGetResponse = ParticipantIdentityManager.GetParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId);
            participantIdentityGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByDisputeResponse = ParticipantIdentityManager.GetIdentitiesByDispute(Client, Data.Dispute.DisputeGuid);
            participantIdentitiesByDisputeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByParticipantResponse = ParticipantIdentityManager.GetIdentitiesByParticipant(Client, Data.Participant.ParticipantId);
            participantIdentitiesByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            participantIdentityPostResponse = ParticipantIdentityManager.CreateParticipantIdentity(Client, new ParticipantIdentityPostRequest());
            participantIdentityPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityPatchResponse = ParticipantIdentityManager.UpdateParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId, new ParticipantIdentityPatchRequest() { IdentityStatus = 4 });
            participantIdentityPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityDeleteResponse = ParticipantIdentityManager.DeleteParticipantIdentity(Client, Data.ParticipantIdentities[1].ParticipantIdentityId);
            participantIdentityDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentityGetResponse = ParticipantIdentityManager.GetParticipantIdentity(Client, Data.ParticipantIdentities[0].ParticipantIdentityId);
            participantIdentityGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByDisputeResponse = ParticipantIdentityManager.GetIdentitiesByDispute(Client, Data.Dispute.DisputeGuid);
            participantIdentitiesByDisputeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            participantIdentitiesByParticipantResponse = ParticipantIdentityManager.GetIdentitiesByParticipant(Client, Data.Participant.ParticipantId);
            participantIdentitiesByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
