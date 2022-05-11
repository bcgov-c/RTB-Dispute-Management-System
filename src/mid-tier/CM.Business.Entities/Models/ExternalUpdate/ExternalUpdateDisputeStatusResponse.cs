using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalUpdateDisputeStatusResponse
{
    [JsonIgnore]
    public int DisputeStatusId { get; set; }

    [JsonProperty("dispute_status")]
    public byte? Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }
}