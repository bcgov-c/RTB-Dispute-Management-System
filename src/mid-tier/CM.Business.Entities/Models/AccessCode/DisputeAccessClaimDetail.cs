using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessClaimDetail
{
    [JsonProperty("claim_detail_id")]
    public int ClaimDetailId { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("description_by")]
    public int DescriptionBy { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}