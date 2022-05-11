using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.RemedyDetail;

public class RemedyDetailResponse : CommonResponse
{
    [JsonProperty("remedy_detail_id")]
    public int RemedyDetailId { get; set; }

    [JsonProperty("remedy_id")]
    public int RemedyId { get; set; }

    [JsonProperty("description_by")]
    public int DescriptionBy { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("amount")]
    public decimal Amount { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("associated_date")]
    public string AssociatedDate { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}