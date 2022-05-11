using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeStatusPostRequest
{
    [JsonProperty("dispute_status")]
    public byte? Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("status_note")]
    public string StatusNote { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }
}