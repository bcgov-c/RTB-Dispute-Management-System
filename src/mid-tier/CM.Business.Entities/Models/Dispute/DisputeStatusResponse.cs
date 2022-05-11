using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeStatusResponse
{
    [JsonProperty("dispute_status_id")]
    public int DisputeStatusId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("dispute_status")]
    public byte Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [StringLength(255)]
    [JsonProperty("status_note")]
    public string StatusNote { get; set; }

    [JsonProperty("status_start_date")]
    public string StatusStartDate { get; set; }

    [JsonProperty("status_set_by")]
    public int StatusSetBy { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("duration_seconds")]
    public int DurationSeconds { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }
}