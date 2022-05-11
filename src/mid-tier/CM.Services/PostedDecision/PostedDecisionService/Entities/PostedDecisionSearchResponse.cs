using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionSearchResponse
{
    public PostedDecisionSearchResponse()
    {
        PostedDecisionResponses = new List<PostedDecisionResponse>();
    }

    [JsonProperty("total_database_records")]
    public int TotalDatabaseRecords { get; set; }

    [JsonProperty("earliest_record_date")]
    public string EarliestRecordDate { get; set; }

    [JsonProperty("total_available_records")]
    public long TotalAvailableRecords { get; set; }

    [JsonProperty("posted_decisions")]
    public List<PostedDecisionResponse> PostedDecisionResponses { get; set; }
}