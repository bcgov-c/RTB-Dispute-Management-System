using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckOnlineMeetingSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var onlineMeetingPostResponse = OnlineMeetingManager.CreateOnlineMeeting(Client, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPostRequest());
            onlineMeetingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var onlineMeetingPatchResponse = OnlineMeetingManager.UpdateOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPatchRequest() { ConferenceUrl = "ABC" });
            onlineMeetingPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var onlineMeetingDeleteResponse = OnlineMeetingManager.DeleteOnlineMeeting(Client, Data.OnlineMeetings[6].OnlineMeetingId);
            onlineMeetingDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var onlineMeetingGetResponse = OnlineMeetingManager.GetOnlineMeeting(Client, Data.OnlineMeetings[5].OnlineMeetingId);
            onlineMeetingGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            onlineMeetingPostResponse = OnlineMeetingManager.CreateOnlineMeeting(Client, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPostRequest());
            onlineMeetingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingPatchResponse = OnlineMeetingManager.UpdateOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPatchRequest() { ConferenceUrl = "ABC" });
            onlineMeetingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingDeleteResponse = OnlineMeetingManager.DeleteOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId);
            onlineMeetingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingGetResponse = OnlineMeetingManager.GetOnlineMeeting(Client, Data.OnlineMeetings[5].OnlineMeetingId);
            onlineMeetingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            onlineMeetingPostResponse = OnlineMeetingManager.CreateOnlineMeeting(Client, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPostRequest());
            onlineMeetingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingPatchResponse = OnlineMeetingManager.UpdateOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPatchRequest() { ConferenceUrl = "ABC" });
            onlineMeetingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingDeleteResponse = OnlineMeetingManager.DeleteOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId);
            onlineMeetingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingGetResponse = OnlineMeetingManager.GetOnlineMeeting(Client, Data.OnlineMeetings[5].OnlineMeetingId);
            onlineMeetingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            onlineMeetingPostResponse = OnlineMeetingManager.CreateOnlineMeeting(Client, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPostRequest());
            onlineMeetingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingPatchResponse = OnlineMeetingManager.UpdateOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId, new Business.Entities.Models.OnlineMeeting.OnlineMeetingPatchRequest() { ConferenceUrl = "ABC" });
            onlineMeetingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingDeleteResponse = OnlineMeetingManager.DeleteOnlineMeeting(Client, Data.OnlineMeetings[0].OnlineMeetingId);
            onlineMeetingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            onlineMeetingGetResponse = OnlineMeetingManager.GetOnlineMeeting(Client, Data.OnlineMeetings[5].OnlineMeetingId);
            onlineMeetingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
