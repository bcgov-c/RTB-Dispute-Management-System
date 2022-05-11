using System.Net;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDisputeHearingSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeHearingGetResponse = DisputeHearingManager.GetDisputeHearings(Client, Data.Dispute.DisputeGuid);
        disputeHearingGetResponse.CheckStatusCode();

        // SCHEDULER ADMIN(STAFF) USERS
        Client.Authenticate(Data.HearingUsers[0].Username, "12345" + Data.HearingUsers[0].Username);

        var disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest());
        disputeHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeHearingPatchResponse = DisputeHearingManager.UpdateDisputeHearing(Client, Data.DisputeHearings[0].DisputeHearingId, new DisputeHearingPatchRequest());
        disputeHearingPatchResponse.CheckStatusCode();

        var disputeHearingDeleteResponse = DisputeHearingManager.DeleteDisputeHearing(Client, Data.DisputeHearings[1].DisputeHearingId);
        disputeHearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeHearingGetHistoryResponse = DisputeHearingManager.GetDisputeHearingsHistory(Client, new DisputeHearingHistoryRequest { SearchType = 1, DisputeGuid = Data.Dispute.DisputeGuid, HearingId = null });
        disputeHearingGetHistoryResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED STAFF
        Client.Authenticate("admin2", "admin2");

        disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest());
        disputeHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingPatchResponse = DisputeHearingManager.UpdateDisputeHearing(Client, Data.DisputeHearings[0].DisputeHearingId, new DisputeHearingPatchRequest());
        disputeHearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingDeleteResponse = DisputeHearingManager.DeleteDisputeHearing(Client, Data.DisputeHearings[1].DisputeHearingId);
        disputeHearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetHistoryResponse = DisputeHearingManager.GetDisputeHearingsHistory(Client, new DisputeHearingHistoryRequest { SearchType = 1, DisputeGuid = Data.Dispute.DisputeGuid });
        disputeHearingGetHistoryResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest());
        disputeHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingPatchResponse = DisputeHearingManager.UpdateDisputeHearing(Client, Data.DisputeHearings[0].DisputeHearingId, new DisputeHearingPatchRequest());
        disputeHearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingDeleteResponse = DisputeHearingManager.DeleteDisputeHearing(Client, Data.DisputeHearings[1].DisputeHearingId);
        disputeHearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetResponse = DisputeHearingManager.GetDisputeHearings(Client, Data.Dispute.DisputeGuid);
        disputeHearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetHistoryResponse = DisputeHearingManager.GetDisputeHearingsHistory(Client, new DisputeHearingHistoryRequest { SearchType = 1, DisputeGuid = Data.Dispute.DisputeGuid });
        disputeHearingGetHistoryResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest());
        disputeHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingPatchResponse = DisputeHearingManager.UpdateDisputeHearing(Client, Data.DisputeHearings[0].DisputeHearingId, new DisputeHearingPatchRequest());
        disputeHearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingDeleteResponse = DisputeHearingManager.DeleteDisputeHearing(Client, Data.DisputeHearings[1].DisputeHearingId);
        disputeHearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetResponse = DisputeHearingManager.GetDisputeHearings(Client, Data.Dispute.DisputeGuid);
        disputeHearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetHistoryResponse = DisputeHearingManager.GetDisputeHearingsHistory(Client, new DisputeHearingHistoryRequest { SearchType = 1, DisputeGuid = Data.Dispute.DisputeGuid });
        disputeHearingGetHistoryResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest());
        disputeHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingPatchResponse = DisputeHearingManager.UpdateDisputeHearing(Client, Data.DisputeHearings[0].DisputeHearingId, new DisputeHearingPatchRequest());
        disputeHearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingDeleteResponse = DisputeHearingManager.DeleteDisputeHearing(Client, Data.DisputeHearings[1].DisputeHearingId);
        disputeHearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetResponse = DisputeHearingManager.GetDisputeHearings(Client, Data.Dispute.DisputeGuid);
        disputeHearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeHearingGetHistoryResponse = DisputeHearingManager.GetDisputeHearingsHistory(Client, new DisputeHearingHistoryRequest { SearchType = 1, DisputeGuid = Data.Dispute.DisputeGuid });
        disputeHearingGetHistoryResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}