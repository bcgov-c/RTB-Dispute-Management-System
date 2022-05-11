using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessClaim
{
    public DisputeAccessClaim()
    {
        ClaimDetails = new List<DisputeAccessClaimDetail>();
        Remedies = new List<DisputeAccessRemedy>();
        FileDescriptions = new List<DisputeAccessFileDescription>();
    }

    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("claim_status")]
    public byte? ClaimStatus { get; set; }

    [JsonProperty("claim_type")]
    public byte? ClaimType { get; set; }

    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }

    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("claim_title")]
    public string ClaimTitle { get; set; }

    [JsonProperty("claim_details")]
    public List<DisputeAccessClaimDetail> ClaimDetails { get; set; }

    [JsonProperty("file_description")]
    public List<DisputeAccessFileDescription> FileDescriptions { get; set; }

    [JsonProperty("remedies")]
    public List<DisputeAccessRemedy> Remedies { get; set; }
}