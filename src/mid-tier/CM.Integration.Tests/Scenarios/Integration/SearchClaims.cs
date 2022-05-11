using System.Linq;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void SearchClaims()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var dispute1 = DisputeManager.CreateDispute(Client);
        var disputeStatusRequest = new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationScreening,
            Status = (byte)DisputeStatuses.ConfirmingInformation
        };
        DisputeManager.CreateDisputeStatus(Client, dispute1.ResponseObject.DisputeGuid, disputeStatusRequest);
        var claimGroup1 = ClaimManager.CreateClaimGroup(Client, dispute1.ResponseObject.DisputeGuid);

        var dispute2 = DisputeManager.CreateDispute(Client);
        DisputeManager.CreateDisputeStatus(Client, dispute2.ResponseObject.DisputeGuid, disputeStatusRequest);
        var claimGroup2 = ClaimManager.CreateClaimGroup(Client, dispute2.ResponseObject.DisputeGuid);

        var claimRequest1 = new ClaimRequest
        {
            ClaimCode = 105,
            ClaimStatus = (byte)ClaimStatus.Include,
            ClaimTitle = "A-Claim-1"
        };

        Client.SetDisputeGuidHeaderToken(dispute1.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaim(Client, claimGroup1.ResponseObject.ClaimGroupId, claimRequest1);

        var claimRequest2 = new ClaimRequest
        {
            ClaimCode = 108,
            ClaimStatus = (byte)ClaimStatus.Include,
            ClaimTitle = "B-Claim-2"
        };

        Client.SetDisputeGuidHeaderToken(dispute2.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaim(Client, claimGroup2.ResponseObject.ClaimGroupId, claimRequest2);

        var searchRequest1 = new ClaimsSearchRequest { ClaimCodes = new[] { 105 }, SortDirection = SortDir.Asc };
        var search1 = SearchManager.SearchByClaims(Client, searchRequest1);
        Assert.True(search1.ResponseObject.SearchResponses.Count == 1);
        Assert.True(search1.ResponseObject.SearchResponses.First().DisputeGuid == dispute1.ResponseObject.DisputeGuid);

        var searchRequest2 = new ClaimsSearchRequest { ClaimCodes = new[] { 105, 108 }, SortDirection = SortDir.Asc };
        var search2 = SearchManager.SearchByClaims(Client, searchRequest2);
        Assert.True(search2.ResponseObject.SearchResponses.Count == 0);

        var searchRequest3 = new ClaimsSearchRequest { ClaimCodes = new[] { 101 }, SortDirection = SortDir.Asc };
        var search3 = SearchManager.SearchByClaims(Client, searchRequest3);
        Assert.True(search3.ResponseObject.SearchResponses.Count == 0);

        var searchRequest4 = new ClaimsSearchRequest { ClaimCodes = new[] { 101, 105 }, SortDirection = SortDir.Asc };
        var search4 = SearchManager.SearchByClaims(Client, searchRequest4);
        Assert.True(search4.ResponseObject.SearchResponses.Count == 0);
    }
}