using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ClaimDetail;

public class ClaimDetailResponse : CommonResponse
{
    [JsonProperty("claim_detail_id")]
    public int ClaimDetailId { get; set; }

    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("description_by")]
    public int DescriptionBy { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("notice_date")]
    public string NoticeDate { get; set; }

    [JsonProperty("notice_method")]
    public byte NoticeMethod { get; set; }

    [JsonProperty("when_aware")]
    public string WhenAware { get; set; }

    [JsonProperty("location")]
    public string Location { get; set; }

    [JsonProperty("impact")]
    public string Impact { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}