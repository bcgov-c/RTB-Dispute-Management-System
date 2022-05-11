using System.Net;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDisputeProcessDetailSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeProcessDetailPostResponse = DisputeProcessDetailManager.CreateDisputeProcessDetail(Client, Data.Dispute.DisputeGuid, new DisputeProcessDetailPostRequest { AssociatedProcess = 1, StartDisputeStatusId = 1 });
        disputeProcessDetailPostResponse.CheckStatusCode();

        var disputeProcessDetailPatchResponse = DisputeProcessDetailManager.UpdateDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId, new DisputeProcessDetailPatchRequest());
        disputeProcessDetailPatchResponse.CheckStatusCode();

        var disputeProcessDetailDeleteResponse = DisputeProcessDetailManager.DeleteDisputeProcessDetail(Client, Data.DisputeProcessDetails[5].DisputeProcessDetailId);
        disputeProcessDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeProcessDetailGetResponse = DisputeProcessDetailManager.GetDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId);
        disputeProcessDetailGetResponse.CheckStatusCode();

        var disputeProcessDetailGetAllResponse = DisputeProcessDetailManager.GetDisputeDisputeProcessDetails(Client, Data.Dispute.DisputeGuid);
        disputeProcessDetailGetAllResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        disputeProcessDetailPostResponse = DisputeProcessDetailManager.CreateDisputeProcessDetail(Client, Data.Dispute.DisputeGuid, new DisputeProcessDetailPostRequest { AssociatedProcess = 1, StartDisputeStatusId = 1 });
        disputeProcessDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailPatchResponse = DisputeProcessDetailManager.UpdateDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId, new DisputeProcessDetailPatchRequest());
        disputeProcessDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailDeleteResponse = DisputeProcessDetailManager.DeleteDisputeProcessDetail(Client, Data.DisputeProcessDetails[5].DisputeProcessDetailId);
        disputeProcessDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetResponse = DisputeProcessDetailManager.GetDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId);
        disputeProcessDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetAllResponse = DisputeProcessDetailManager.GetDisputeDisputeProcessDetails(Client, Data.Dispute.DisputeGuid);
        disputeProcessDetailGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        disputeProcessDetailPostResponse = DisputeProcessDetailManager.CreateDisputeProcessDetail(Client, Data.Dispute.DisputeGuid, new DisputeProcessDetailPostRequest { AssociatedProcess = 1, StartDisputeStatusId = 1 });
        disputeProcessDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailPatchResponse = DisputeProcessDetailManager.UpdateDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId, new DisputeProcessDetailPatchRequest());
        disputeProcessDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailDeleteResponse = DisputeProcessDetailManager.DeleteDisputeProcessDetail(Client, Data.DisputeProcessDetails[5].DisputeProcessDetailId);
        disputeProcessDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetResponse = DisputeProcessDetailManager.GetDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId);
        disputeProcessDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetAllResponse = DisputeProcessDetailManager.GetDisputeDisputeProcessDetails(Client, Data.Dispute.DisputeGuid);
        disputeProcessDetailGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        disputeProcessDetailPostResponse = DisputeProcessDetailManager.CreateDisputeProcessDetail(Client, Data.Dispute.DisputeGuid, new DisputeProcessDetailPostRequest { AssociatedProcess = 1, StartDisputeStatusId = 1 });
        disputeProcessDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailPatchResponse = DisputeProcessDetailManager.UpdateDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId, new DisputeProcessDetailPatchRequest());
        disputeProcessDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailDeleteResponse = DisputeProcessDetailManager.DeleteDisputeProcessDetail(Client, Data.DisputeProcessDetails[5].DisputeProcessDetailId);
        disputeProcessDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetResponse = DisputeProcessDetailManager.GetDisputeProcessDetail(Client, Data.DisputeProcessDetails[1].DisputeProcessDetailId);
        disputeProcessDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeProcessDetailGetAllResponse = DisputeProcessDetailManager.GetDisputeDisputeProcessDetails(Client, Data.Dispute.DisputeGuid);
        disputeProcessDetailGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}