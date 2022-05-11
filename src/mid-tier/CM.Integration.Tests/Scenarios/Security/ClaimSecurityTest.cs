using System.Net;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckClaimSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var claimPostResponse = ClaimManager.CreateClaim(Client, Data.ClaimGroups[0].ClaimGroupId, new ClaimRequest());
        claimPostResponse.CheckStatusCode();

        var claimPatchResponse = ClaimManager.UpdateClaim(Client, Data.Claims[1].ClaimId, new ClaimRequest());
        claimPatchResponse.CheckStatusCode();

        var claimGetResponse = ClaimManager.GetClaim(Client, Data.Claims[1].ClaimId);
        claimGetResponse.CheckStatusCode();

        var disputeClaimsGetResponse = ClaimManager.GetDisputeClaims(Client, Data.Dispute.DisputeGuid);
        disputeClaimsGetResponse.CheckStatusCode();

        var claimDeleteResponse = ClaimManager.DeleteClaim(Client, Data.Claims[5].ClaimId);
        claimDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Data.Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
        claimDetailPostResponse.CheckStatusCode();

        var claimDetailPatchResponse = ClaimManager.UpdateClaimDetail(Client, Data.ClaimDetails[1].ClaimDetailId, new ClaimDetailRequest());
        claimDetailPatchResponse.CheckStatusCode();

        var claimDetailDeleteResponse = ClaimManager.DeleteClaimDetail(Client, Data.ClaimDetails[5].ClaimDetailId);
        claimDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        claimPostResponse = ClaimManager.CreateClaim(Client, Data.ClaimGroups[0].ClaimGroupId, new ClaimRequest());
        claimPostResponse.CheckStatusCode();

        claimPatchResponse = ClaimManager.UpdateClaim(Client, Data.Claims[1].ClaimId, new ClaimRequest());
        claimPatchResponse.CheckStatusCode();

        claimGetResponse = ClaimManager.GetClaim(Client, Data.Claims[1].ClaimId);
        claimGetResponse.CheckStatusCode();

        disputeClaimsGetResponse = ClaimManager.GetDisputeClaims(Client, Data.Dispute.DisputeGuid);
        disputeClaimsGetResponse.CheckStatusCode();

        claimDeleteResponse = ClaimManager.DeleteClaim(Client, Data.Claims[4].ClaimId);
        claimDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Data.Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
        claimDetailPostResponse.CheckStatusCode();

        claimDetailPatchResponse = ClaimManager.UpdateClaimDetail(Client, Data.ClaimDetails[1].ClaimDetailId, new ClaimDetailRequest());
        claimDetailPatchResponse.CheckStatusCode();

        claimDetailDeleteResponse = ClaimManager.DeleteClaimDetail(Client, Data.ClaimDetails[4].ClaimDetailId);
        claimDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        claimPostResponse = ClaimManager.CreateClaim(Client, Data.ClaimGroups[0].ClaimGroupId, new ClaimRequest());
        claimPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimPatchResponse = ClaimManager.UpdateClaim(Client, Data.Claims[1].ClaimId, new ClaimRequest());
        claimPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimGetResponse = ClaimManager.GetClaim(Client, Data.Claims[1].ClaimId);
        claimGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeClaimsGetResponse = ClaimManager.GetDisputeClaims(Client, Data.Dispute.DisputeGuid);
        disputeClaimsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDeleteResponse = ClaimManager.DeleteClaim(Client, Data.Claims[4].ClaimId);
        claimDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Data.Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
        claimDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPatchResponse = ClaimManager.UpdateClaimDetail(Client, Data.ClaimDetails[1].ClaimDetailId, new ClaimDetailRequest());
        claimDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailDeleteResponse = ClaimManager.DeleteClaimDetail(Client, Data.ClaimDetails[4].ClaimDetailId);
        claimDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        claimPostResponse = ClaimManager.CreateClaim(Client, Data.ClaimGroups[0].ClaimGroupId, new ClaimRequest());
        claimPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimPatchResponse = ClaimManager.UpdateClaim(Client, Data.Claims[1].ClaimId, new ClaimRequest());
        claimPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimGetResponse = ClaimManager.GetClaim(Client, Data.Claims[1].ClaimId);
        claimGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeClaimsGetResponse = ClaimManager.GetDisputeClaims(Client, Data.Dispute.DisputeGuid);
        disputeClaimsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDeleteResponse = ClaimManager.DeleteClaim(Client, Data.Claims[4].ClaimId);
        claimDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Data.Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
        claimDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPatchResponse = ClaimManager.UpdateClaimDetail(Client, Data.ClaimDetails[1].ClaimDetailId, new ClaimDetailRequest());
        claimDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailDeleteResponse = ClaimManager.DeleteClaimDetail(Client, Data.ClaimDetails[4].ClaimDetailId);
        claimDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        claimPostResponse = ClaimManager.CreateClaim(Client, Data.ClaimGroups[0].ClaimGroupId, new ClaimRequest());
        claimPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimPatchResponse = ClaimManager.UpdateClaim(Client, Data.Claims[1].ClaimId, new ClaimRequest());
        claimPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimGetResponse = ClaimManager.GetClaim(Client, Data.Claims[1].ClaimId);
        claimGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeClaimsGetResponse = ClaimManager.GetDisputeClaims(Client, Data.Dispute.DisputeGuid);
        disputeClaimsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDeleteResponse = ClaimManager.DeleteClaim(Client, Data.Claims[4].ClaimId);
        claimDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Data.Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
        claimDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailPatchResponse = ClaimManager.UpdateClaimDetail(Client, Data.ClaimDetails[1].ClaimDetailId, new ClaimDetailRequest());
        claimDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        claimDetailDeleteResponse = ClaimManager.DeleteClaimDetail(Client, Data.ClaimDetails[4].ClaimDetailId);
        claimDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}