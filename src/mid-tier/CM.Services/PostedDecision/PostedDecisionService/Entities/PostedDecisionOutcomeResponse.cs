using Newtonsoft.Json;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionOutcomeResponse
{
    [JsonProperty("remedy_type")]
    public byte RemedyType { get; set; }

    [JsonProperty("remedy_status")]
    public byte RemedyStatus { get; set; }

    [JsonProperty("remedy_sub_status")]
    public byte? RemedySubStatus { get; set; }

    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }
}