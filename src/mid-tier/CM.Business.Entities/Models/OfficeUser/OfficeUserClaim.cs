using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserClaim
{
    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("claim_type")]
    public int ClaimType { get; set; }

    [JsonProperty("claim_code")]
    public int ClaimCode { get; set; }

    [JsonProperty("claim_status")]
    public byte? ClaimStatus { get; set; }

    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("claim_details")]
    public List<OfficeUserClaimDetail> ClaimDetails { get; set; }
}