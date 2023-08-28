using System.Net;
using CM.Business.Entities.Models.Poll;
using CM.Data.Model;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckPollSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Data.HearingUsers[0].Username, "12345" + Data.HearingUsers[0].Username);

            var pollPostResponse = PollManager.CreatePoll(Client, new PollRequest() { PollTitle = "Poll-Title-test-1", PollType = 1 });
            pollPostResponse.CheckStatusCode();

            var pollPatchResponse = PollManager.UpdatePoll(Client, Data.Polls[1].PollId, new PollPatchRequest() { PollDescription = "New Desc-1" });
            pollPatchResponse.CheckStatusCode();

            var pollGetResponse = PollManager.GetPoll(Client, Data.Polls[2].PollId);
            pollGetResponse.CheckStatusCode();

            var pollsGetResponse = PollManager.GetPolls(Client, new PollGetRequest() { PollType = 1 });
            pollsGetResponse.CheckStatusCode();

            var pollDeleteResponse = PollManager.DeletePoll(Client, Data.Polls[3].PollId);
            pollDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            //// Poll Response part
            Client.Authenticate(Users.Admin, Users.Admin);

            var pollRespPostResponse = PollManager
                .CreatePollResp(Client, Data.Polls[0].PollId, new Business.Entities.Models.PollResponse.PollRespRequest() { DisputeGuid = Data.Dispute.DisputeGuid, ResponseJson = "{\"resp 1\": \"resp1\"}" });
            pollRespPostResponse.CheckStatusCode();

            var pollRespPatchResponse = PollManager
                .UpdatePollResp(Client, Data.PollResponses[1].PollResponseId, new Business.Entities.Models.PollResponse.PollRespPatchRequest() { ResponseText = "Resp-Text-Changed" });
            pollRespPatchResponse.CheckStatusCode();

            var pollRespGetResponse = PollManager.GetPollResp(Client, Data.Polls[2].PollId);
            pollRespGetResponse.CheckStatusCode();

            var pollsByParticipationGetResponse = PollManager.GetParticipantPollResponses(Client, Data.Participant.ParticipantId);
            pollsByParticipationGetResponse.CheckStatusCode();

            var pollsByDisputeGetResponse = PollManager.GetDisputePollResponses(Client, Data.Dispute.DisputeGuid);
            pollsByDisputeGetResponse.CheckStatusCode();

            var pollRespDeleteResponse = PollManager.DeletePollResp(Client, Data.PollResponses[3].PollResponseId);
            pollRespDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            pollPostResponse = PollManager.CreatePoll(Client, new PollRequest() { PollTitle = "Poll-Title-test-2", PollType = 1 });
            pollPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollPatchResponse = PollManager.UpdatePoll(Client, Data.Polls[1].PollId, new PollPatchRequest() { PollDescription = "New Desc-1" });
            pollPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollGetResponse = PollManager.GetPoll(Client, Data.Polls[2].PollId);
            pollGetResponse.CheckStatusCode();

            pollsGetResponse = PollManager.GetPolls(Client, new PollGetRequest() { PollType = 1 });
            pollsGetResponse.CheckStatusCode();

            pollDeleteResponse = PollManager.DeletePoll(Client, Data.Polls[3].PollId);
            pollDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.OK);

            //// Poll Response part
            Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

            pollRespPostResponse = PollManager
                .CreatePollResp(Client, Data.Polls[0].PollId, new Business.Entities.Models.PollResponse.PollRespRequest() { DisputeGuid = Data.Dispute.DisputeGuid, ResponseJson = "{\"resp1\": \"resp1\"}" });
            pollRespPostResponse.CheckStatusCode();

            pollRespPatchResponse = PollManager
                .UpdatePollResp(Client, Data.PollResponses[1].PollResponseId, new Business.Entities.Models.PollResponse.PollRespPatchRequest() { ResponseText = "Resp-Text-Changed" });
            pollRespPatchResponse.CheckStatusCode();

            pollRespGetResponse = PollManager.GetPollResp(Client, Data.Polls[2].PollId);
            pollRespGetResponse.CheckStatusCode();

            pollsByParticipationGetResponse = PollManager.GetParticipantPollResponses(Client, Data.Participant.ParticipantId);
            pollsByParticipationGetResponse.CheckStatusCode();

            pollsByDisputeGetResponse = PollManager.GetDisputePollResponses(Client, Data.Dispute.DisputeGuid);
            pollsByDisputeGetResponse.CheckStatusCode();

            pollRespDeleteResponse = PollManager.DeletePollResp(Client, pollRespPostResponse.ResponseObject.PollResponseId);
            pollRespDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // LOGIN AS UNAUTHORIZED EXTERNAL USER //
            Client.Authenticate(Users.User2, Users.User2);
            Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

            pollRespPostResponse = PollManager
                .CreatePollResp(Client, Data.Polls[0].PollId, new Business.Entities.Models.PollResponse.PollRespRequest() { DisputeGuid = Data.Dispute.DisputeGuid, ResponseJson = "{\"resp 1\": \"resp1\"}" });
            pollRespPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespPatchResponse = PollManager
                .UpdatePollResp(Client, Data.PollResponses[1].PollResponseId, new Business.Entities.Models.PollResponse.PollRespPatchRequest() { ResponseText = "Resp-Text-Changed" });
            pollRespPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespGetResponse = PollManager.GetPollResp(Client, Data.Polls[2].PollId);
            pollRespGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollsByParticipationGetResponse = PollManager.GetParticipantPollResponses(Client, Data.Participant.ParticipantId);
            pollsByParticipationGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollsByDisputeGetResponse = PollManager.GetDisputePollResponses(Client, Data.Dispute.DisputeGuid);
            pollsByDisputeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespDeleteResponse = PollManager.DeletePollResp(Client, Data.PollResponses[3].PollResponseId);
            pollRespDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.OK);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            pollPostResponse = PollManager.CreatePoll(Client, new PollRequest() { PollTitle = "Poll-Title-test-3", PollType = 1 });
            pollPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollPatchResponse = PollManager.UpdatePoll(Client, Data.Polls[1].PollId, new PollPatchRequest() { PollDescription = "New Desc-1" });
            pollPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollGetResponse = PollManager.GetPoll(Client, Data.Polls[2].PollId);
            pollGetResponse.CheckStatusCode();

            pollsGetResponse = PollManager.GetPolls(Client, new PollGetRequest() { PollType = 1 });
            pollsGetResponse.CheckStatusCode();

            pollDeleteResponse = PollManager.DeletePoll(Client, Data.Polls[3].PollId);
            pollDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.OK);

            //// Poll Response part

            pollRespPostResponse = PollManager
                .CreatePollResp(Client, Data.Polls[0].PollId, new Business.Entities.Models.PollResponse.PollRespRequest() { DisputeGuid = Data.Dispute.DisputeGuid, ResponseJson = "{\"resp 1\": \"resp1\"}" });
            pollRespPostResponse.CheckStatusCode();

            pollRespPatchResponse = PollManager
                .UpdatePollResp(Client, Data.PollResponses[1].PollResponseId, new Business.Entities.Models.PollResponse.PollRespPatchRequest() { ResponseText = "Resp-Text-Changed" });
            pollRespPatchResponse.CheckStatusCode();

            pollRespGetResponse = PollManager.GetPollResp(Client, Data.Polls[2].PollId);
            pollRespGetResponse.CheckStatusCode();

            pollsByParticipationGetResponse = PollManager.GetParticipantPollResponses(Client, Data.Participant.ParticipantId);
            pollsByParticipationGetResponse.CheckStatusCode();

            pollsByDisputeGetResponse = PollManager.GetDisputePollResponses(Client, Data.Dispute.DisputeGuid);
            pollsByDisputeGetResponse.CheckStatusCode();

            pollRespDeleteResponse = PollManager.DeletePollResp(Client, Data.PollResponses[4].PollResponseId);
            pollRespDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            pollPostResponse = PollManager.CreatePoll(Client, new PollRequest() { PollTitle = "Poll-Title-test-3", PollType = 1 });
            pollPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollPatchResponse = PollManager.UpdatePoll(Client, Data.Polls[1].PollId, new PollPatchRequest() { PollDescription = "New Desc-1" });
            pollPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollGetResponse = PollManager.GetPoll(Client, Data.Polls[2].PollId);
            pollGetResponse.CheckStatusCode();

            pollsGetResponse = PollManager.GetPolls(Client, new PollGetRequest() { PollType = 1 });
            pollsGetResponse.CheckStatusCode();

            pollDeleteResponse = PollManager.DeletePoll(Client, Data.Polls[3].PollId);
            pollDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.OK);

            //// Poll Response part

            pollRespPostResponse = PollManager
                .CreatePollResp(Client, Data.Polls[0].PollId, new Business.Entities.Models.PollResponse.PollRespRequest() { DisputeGuid = Data.Dispute.DisputeGuid, ResponseJson = "{\"resp 1\": \"resp1\"}" });
            pollRespPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespPatchResponse = PollManager
                .UpdatePollResp(Client, Data.PollResponses[1].PollResponseId, new Business.Entities.Models.PollResponse.PollRespPatchRequest() { ResponseText = "Resp-Text-Changed" });
            pollRespPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespGetResponse = PollManager.GetPollResp(Client, Data.Polls[2].PollId);
            pollRespGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollsByParticipationGetResponse = PollManager.GetParticipantPollResponses(Client, Data.Participant.ParticipantId);
            pollsByParticipationGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollsByDisputeGetResponse = PollManager.GetDisputePollResponses(Client, Data.Dispute.DisputeGuid);
            pollsByDisputeGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.OK);

            pollRespDeleteResponse = PollManager.DeletePollResp(Client, Data.PollResponses[5].PollResponseId);
            pollRespDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.OK);
        }
    }
}
