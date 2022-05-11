using System.Net;
using CM.Business.Entities.Models.Payment;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDisputeFeeSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Data.Dispute.DisputeGuid, new DisputeFeeRequest());
        disputeFeePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeFeePatchResponse = DisputeFeeManager.UpdateDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId, new PatchDisputeFeeRequest());
        disputeFeePatchResponse.CheckStatusCode();

        var disputeFeeDeleteResponse = DisputeFeeManager.DeleteDisputeFee(Client, Data.DisputeFees[1].DisputeFeeId);
        disputeFeeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeFeeGetResponse = DisputeFeeManager.GetDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId);
        disputeFeeGetResponse.CheckStatusCode();

        var disputeFeesGetResponse = DisputeFeeManager.GetDisputeFees(Client, Data.Dispute.DisputeGuid);
        disputeFeesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Data.Dispute.DisputeGuid, new DisputeFeeRequest());
        disputeFeePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeFeePatchResponse = DisputeFeeManager.UpdateDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId, new PatchDisputeFeeRequest());
        disputeFeePatchResponse.CheckStatusCode();

        disputeFeeDeleteResponse = DisputeFeeManager.DeleteDisputeFee(Client, Data.DisputeFees[2].DisputeFeeId);
        disputeFeeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeGetResponse = DisputeFeeManager.GetDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId);
        disputeFeeGetResponse.CheckStatusCode();

        disputeFeesGetResponse = DisputeFeeManager.GetDisputeFees(Client, Data.Dispute.DisputeGuid);
        disputeFeesGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Data.Dispute.DisputeGuid, new DisputeFeeRequest());
        disputeFeePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeePatchResponse = DisputeFeeManager.UpdateDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId, new PatchDisputeFeeRequest());
        disputeFeePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeGetResponse = DisputeFeeManager.GetDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId);
        disputeFeeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeesGetResponse = DisputeFeeManager.GetDisputeFees(Client, Data.Dispute.DisputeGuid);
        disputeFeesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Data.Dispute.DisputeGuid, new DisputeFeeRequest());
        disputeFeePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeFeePatchResponse = DisputeFeeManager.UpdateDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId, new PatchDisputeFeeRequest());
        disputeFeePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeDeleteResponse = DisputeFeeManager.DeleteDisputeFee(Client, Data.DisputeFees[1].DisputeFeeId);
        disputeFeeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeGetResponse = DisputeFeeManager.GetDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId);
        disputeFeeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeesGetResponse = DisputeFeeManager.GetDisputeFees(Client, Data.Dispute.DisputeGuid);
        disputeFeesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Data.Dispute.DisputeGuid, new DisputeFeeRequest());
        disputeFeePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        disputeFeePatchResponse = DisputeFeeManager.UpdateDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId, new PatchDisputeFeeRequest());
        disputeFeePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeDeleteResponse = DisputeFeeManager.DeleteDisputeFee(Client, Data.DisputeFees[1].DisputeFeeId);
        disputeFeeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeeGetResponse = DisputeFeeManager.GetDisputeFee(Client, Data.DisputeFees[0].DisputeFeeId);
        disputeFeeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFeesGetResponse = DisputeFeeManager.GetDisputeFees(Client, Data.Dispute.DisputeGuid);
        disputeFeesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}