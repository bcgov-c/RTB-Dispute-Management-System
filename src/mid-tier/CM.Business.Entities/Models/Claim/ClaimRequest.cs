using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Claim;

public class ClaimRequest
{
    [JsonProperty("claim_title")]
    [StringLength(150)]
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