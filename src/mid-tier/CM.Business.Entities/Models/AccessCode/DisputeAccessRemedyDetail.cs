using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessRemedyDetail
{
    [JsonProperty("remedy_retail_id")]
    public int RemedyDetailId { get; set; }

    [JsonProperty("description_by")]
    public int DescriptionBy { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}