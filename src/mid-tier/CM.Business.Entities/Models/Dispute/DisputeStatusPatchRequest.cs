using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeStatusPatchRequest
{
    [JsonProperty("status_note")]
    public string StatusNote { get; set; }

    [JsonProperty("stage")]
    public byte Stage { get; set; }

    [JsonProperty("status")]
    public byte Status { get; set; }
}