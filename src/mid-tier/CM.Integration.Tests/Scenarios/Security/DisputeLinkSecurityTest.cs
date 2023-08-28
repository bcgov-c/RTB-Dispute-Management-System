using System.Net;
using CM.Business.Entities.Models.OnlineMeeting;
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
        public void CheckDisputeLinkSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var disputeLinkPostResponse = DisputeLinkManager.CreateDisputeLink(Client, new DisputeLinkPostRequest()
            {
                DisputeGuid = Data.Disputes[3].DisputeGuid,
                DisputeLinkRole = DisputeLinkRole.Primary,
                DisputeLinkType = DisputeLinkType.Cross,
                OnlineMeetingId = Data.OnlineMeetings[2].OnlineMeetingId
            });
            disputeLinkPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeLinkPatchResponse = DisputeLinkManager.UpdateDisputeLink(Client, Data.DisputeLinks[0].DisputeLinkId, new DisputeLinkPatchRequest() { DisputeLinkRole = DisputeLinkRole.Secondary });
            disputeLinkPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeLinkDeleteResponse = DisputeLinkManager.DeleteDisputeLink(Client, Data.DisputeLinks[6].DisputeLinkId);
            disputeLinkDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var disputeLinkGetResponse = DisputeLinkManager.GetDisputeLink(Client, Data.Disputes[3].DisputeGuid);
            disputeLinkGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            disputeLinkPostResponse = DisputeLinkManager.CreateDisputeLink(Client, new DisputeLinkPostRequest()
            {
                DisputeGuid = Data.Disputes[3].DisputeGuid,
                DisputeLinkRole = DisputeLinkRole.Primary,
                DisputeLinkType = DisputeLinkType.Cross,
                OnlineMeetingId = Data.OnlineMeetings[2].OnlineMeetingId
            });
            disputeLinkPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkPatchResponse = DisputeLinkManager.UpdateDisputeLink(Client, Data.DisputeLinks[0].DisputeLinkId, new DisputeLinkPatchRequest() { DisputeLinkRole = DisputeLinkRole.Secondary });
            disputeLinkPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkDeleteResponse = DisputeLinkManager.DeleteDisputeLink(Client, Data.DisputeLinks[6].DisputeLinkId);
            disputeLinkDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkGetResponse = DisputeLinkManager.GetDisputeLink(Client, Data.Disputes[3].DisputeGuid);
            disputeLinkGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            disputeLinkPostResponse = DisputeLinkManager.CreateDisputeLink(Client, new DisputeLinkPostRequest()
            {
                DisputeGuid = Data.Disputes[3].DisputeGuid,
                DisputeLinkRole = DisputeLinkRole.Primary,
                DisputeLinkType = DisputeLinkType.Cross,
                OnlineMeetingId = Data.OnlineMeetings[2].OnlineMeetingId
            });
            disputeLinkPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkPatchResponse = DisputeLinkManager.UpdateDisputeLink(Client, Data.DisputeLinks[0].DisputeLinkId, new DisputeLinkPatchRequest() { DisputeLinkRole = DisputeLinkRole.Secondary });
            disputeLinkPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkDeleteResponse = DisputeLinkManager.DeleteDisputeLink(Client, Data.DisputeLinks[6].DisputeLinkId);
            disputeLinkDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkGetResponse = DisputeLinkManager.GetDisputeLink(Client, Data.Disputes[3].DisputeGuid);
            disputeLinkGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            disputeLinkPostResponse = DisputeLinkManager.CreateDisputeLink(Client, new DisputeLinkPostRequest()
            {
                DisputeGuid = Data.Disputes[3].DisputeGuid,
                DisputeLinkRole = DisputeLinkRole.Primary,
                DisputeLinkType = DisputeLinkType.Cross,
                OnlineMeetingId = Data.OnlineMeetings[2].OnlineMeetingId
            });
            disputeLinkPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkPatchResponse = DisputeLinkManager.UpdateDisputeLink(Client, Data.DisputeLinks[0].DisputeLinkId, new DisputeLinkPatchRequest() { DisputeLinkRole = DisputeLinkRole.Secondary });
            disputeLinkPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkDeleteResponse = DisputeLinkManager.DeleteDisputeLink(Client, Data.DisputeLinks[6].DisputeLinkId);
            disputeLinkDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            disputeLinkGetResponse = DisputeLinkManager.GetDisputeLink(Client, Data.Disputes[3].DisputeGuid);
            disputeLinkGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
