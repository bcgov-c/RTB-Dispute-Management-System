using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Claim;

public class ClaimResponse : CommonResponse
{
    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("claim_title")]
    public string ClaimTitle { get; set; }

    [JsonProperty("claim_type")]
    public byte? ClaimType { get; set; }

    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }

    [JsonProperty("claim_status")]
    public byte? ClaimStatus { get; set; }

    [JsonProperty("claim_source")]
    public byte? ClaimSource { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("claim_status_reason")]
    public byte? ClaimStatusReason { get; set; }
}