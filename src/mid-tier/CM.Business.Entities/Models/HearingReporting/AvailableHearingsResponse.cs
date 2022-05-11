using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class AvailableHearingsResponse
{
    public AvailableHearingsResponse()
    {
        AvailableHearings = new List<AvailableHearing>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("available_hearings")]
    public List<AvailableHearing> AvailableHearings { get; set; }
}

public class AvailableHearing
{
    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("hearing_priority")]
    public byte? HearingPriority { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("hearing_owner")]
    public int? HearingOwner { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDateTime { get; set; }
}