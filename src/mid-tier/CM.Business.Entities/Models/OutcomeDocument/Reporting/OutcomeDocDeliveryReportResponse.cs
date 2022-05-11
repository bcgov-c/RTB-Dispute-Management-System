using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument.Reporting;

public class OutcomeDocDeliveryReportResponse
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("dispute_status")]
    public byte Status { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("delivery_creation")]
    public string DeliveryCreation { get; set; }

    [JsonProperty("highest_undelivered_priority")]
    public byte? HighestUndeliveredPriority { get; set; }

    [JsonProperty("total_undelivered")]
    public int TotalUndelivered { get; set; }

    [JsonProperty("undelivered_by_method")]
    public OutcomeDocDeliveryDeliveryMethodReport OutcomeDocDeliveryDeliveryMethodReport { get; set; }
}