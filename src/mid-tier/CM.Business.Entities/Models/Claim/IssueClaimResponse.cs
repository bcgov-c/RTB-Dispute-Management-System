using System.Collections.Generic;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Entities.Models.Remedy;

namespace CM.Business.Entities.Models.Claim;

public class IssueClaimResponse : ClaimResponse
{
    public IssueClaimResponse()
    {
        Remedies = new List<IssueRemedyResponse>();
        ClaimDetails = new List<IssueClaimDetailResponse>();
    }

    public List<IssueClaimDetailResponse> ClaimDetails { get; set; }

    public List<IssueRemedyResponse> Remedies { get; set; }
}