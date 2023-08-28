using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class ReserveAvailableHearingResponse
{
    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("hearing_priority")]
    public byte? HearingPriority { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public string LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public string LocalEndDateTime { get; set; }

    [JsonProperty("hearing_reserved_until")]
    public string HearingReservedUntil { get; set; }

    [JsonProperty("hearing_reserved_by_id")]
    public int? HearingReservedById { get; set; }

    [JsonProperty("hearing_reserved_dispute_guid")]
    public Guid? HearingReservedDisputeGuid { get; set; }
}