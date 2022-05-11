using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserClaimDetail
{
    [JsonProperty("claim_detail_id")]
    public int ClaimDetailId { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }
}