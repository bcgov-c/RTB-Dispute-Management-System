using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.PostedDecision;

public class PostedDecisionSearchResponse
{
    public PostedDecisionSearchResponse()
    {
        PostedDecisionResponses = new List<PostedDecisionResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("posted_decisions")]
    public List<PostedDecisionResponse> PostedDecisionResponses { get; set; }
}