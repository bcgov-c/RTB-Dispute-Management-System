using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class HearingReport
{
    public HearingReport()
    {
        Disputes = new List<HearingReportDispute>();
    }

    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("hearing_priority")]
    public byte? HearingPriority { get; set; }

    [JsonProperty("hearing_type")]
    public byte HearingType { get; set; }

    [JsonProperty("hearing_sub_type")]
    public byte? HearingSubType { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDateTime { get; set; }

    [JsonProperty("use_custom_schedule")]
    public bool? UseCustomSchedule { get; set; }

    [JsonProperty("use_special_instructions")]
    public bool? UseSpecialInstructions { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("moderator_code")]
    public string ModeratorCode { get; set; }

    [JsonProperty("participant_code")]
    public string ParticipantCode { get; set; }

    [JsonProperty("hearing_reserved_until")]
    public string HearingReservedUntil { get; set; }

    [JsonProperty("hearing_reserved_by_id")]
    public int? HearingReservedById { get; set; }

    [JsonIgnore]
    public int? HearingOwner { get; set; }

    [JsonProperty("associated_disputes")]
    public List<HearingReportDispute> Disputes { get; set; }
}