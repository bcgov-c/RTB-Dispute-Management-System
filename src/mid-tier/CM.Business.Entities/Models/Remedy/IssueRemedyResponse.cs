using System.Collections.Generic;
using CM.Business.Entities.Models.RemedyDetail;

namespace CM.Business.Entities.Models.Remedy;

public class IssueRemedyResponse : RemedyResponse
{
    public IssueRemedyResponse()
    {
        RemedyDetails = new List<IssueRemedyDetailResponse>();
    }

    public List<IssueRemedyDetailResponse> RemedyDetails { get; set; }
}