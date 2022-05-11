using System.Net;
using CM.Business.Entities.Models.Amendment;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckAmendmentSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Data.Dispute.DisputeGuid, new AmendmentRequest());
        amendmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        Client.SetDisputeGuidHeaderToken(Data.Amendments[0].DisputeGuid);
        var amendmentPatchResponse = AmendmentManager.UpdateAmendment(Client, Data.Amendments[0].AmendmentId, new AmendmentRequest());
        amendmentPatchResponse.CheckStatusCode();

        Client.SetDisputeGuidHeaderToken(Data.Amendments[5].DisputeGuid);
        var amendmentGetResponse = AmendmentManager.GetAmendment(Client, Data.Amendments[5].AmendmentId);
        amendmentGetResponse.CheckStatusCode();

        var disputeAmendmentsGetResponse = AmendmentManager.GetDisputeAmendments(Client, Data.Dispute.DisputeGuid);
        disputeAmendmentsGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Data.Dispute.DisputeGuid, new AmendmentRequest());
        amendmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        amendmentPatchResponse = AmendmentManager.UpdateAmendment(Client, Data.Amendments[1].AmendmentId, new AmendmentRequest());
        amendmentPatchResponse.CheckStatusCode();

        amendmentGetResponse = AmendmentManager.GetAmendment(Client, Data.Amendments[5].AmendmentId);
        amendmentGetResponse.CheckStatusCode();

        disputeAmendmentsGetResponse = AmendmentManager.GetDisputeAmendments(Client, Data.Dispute.DisputeGuid);
        disputeAmendmentsGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Data.Dispute.DisputeGuid, new AmendmentRequest());
        amendmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        amendmentPatchResponse = AmendmentManager.UpdateAmendment(Client, Data.Amendments[2].AmendmentId, new AmendmentRequest());
        amendmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        amendmentGetResponse = AmendmentManager.GetAmendment(Client, Data.Amendments[5].AmendmentId);
        amendmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAmendmentsGetResponse = AmendmentManager.GetDisputeAmendments(Client, Data.Dispute.DisputeGuid);
        disputeAmendmentsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Data.Dispute.DisputeGuid, new AmendmentRequest());
        amendmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        amendmentPatchResponse = AmendmentManager.UpdateAmendment(Client, Data.Amendments[3].AmendmentId, new AmendmentRequest());
        amendmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        amendmentGetResponse = AmendmentManager.GetAmendment(Client, Data.Amendments[5].AmendmentId);
        amendmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAmendmentsGetResponse = AmendmentManager.GetDisputeAmendments(Client, Data.Dispute.DisputeGuid);
        disputeAmendmentsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Data.Dispute.DisputeGuid, new AmendmentRequest());
        amendmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        amendmentPatchResponse = AmendmentManager.UpdateAmendment(Client, Data.Amendments[4].AmendmentId, new AmendmentRequest());
        amendmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        amendmentGetResponse = AmendmentManager.GetAmendment(Client, Data.Amendments[5].AmendmentId);
        amendmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAmendmentsGetResponse = AmendmentManager.GetDisputeAmendments(Client, Data.Dispute.DisputeGuid);
        disputeAmendmentsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}