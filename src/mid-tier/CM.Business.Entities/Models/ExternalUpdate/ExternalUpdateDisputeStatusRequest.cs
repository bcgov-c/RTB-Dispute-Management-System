using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalUpdateDisputeStatusRequest
{
    [JsonProperty("dispute_status")]
    public byte? Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }
}