using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class HearingRequest
{
    [JsonProperty("hearing_type")]
    public byte HearingType { get; set; }

    [JsonProperty("hearing_sub_type")]
    public byte? HearingSubType { get; set; }

    [JsonProperty("hearing_priority")]
    public int HearingPriority { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("hearing_owner")]
    public int? HearingOwner { get; set; }

    [JsonProperty("staff_participant1")]
    public int? StaffParticipant1 { get; set; }

    [JsonProperty("staff_participant2")]
    public int? StaffParticipant2 { get; set; }

    [JsonProperty("staff_participant3")]
    public int? StaffParticipant3 { get; set; }

    [JsonProperty("staff_participant4")]
    public int? StaffParticipant4 { get; set; }

    [JsonProperty("staff_participant5")]
    public int? StaffParticipant5 { get; set; }

    [StringLength(255)]
    [JsonProperty("other_staff_participants")]
    public string OtherStaffParticipants { get; set; }

    [JsonProperty("hearing_method")]
    public byte? HearingMethod { get; set; }

    [JsonProperty("use_custom_schedule")]
    public bool? UseCustomSchedule { get; set; }

    [Required]
    [JsonProperty("hearing_start_datetime")]
    public DateTime HearingStartDateTime { get; set; }

    [Required]
    [JsonProperty("hearing_end_datetime")]
    public DateTime HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDateTime { get; set; }

    [StringLength(255)]
    [JsonProperty("hearing_location")]
    public string HearingLocation { get; set; }

    [JsonProperty("use_special_instructions")]
    public bool? UseSpecialInstructions { get; set; }

    [StringLength(1500)]
    [JsonProperty("special_instructions")]
    public string SpecialInstructions { get; set; }

    [StringLength(1500)]
    [JsonProperty("hearing_details")]
    public string HearingDetails { get; set; }

    [StringLength(255)]
    [JsonProperty("hearing_note")]
    public string HearingNote { get; set; }
}

public class HearingPatchRequest : HearingRequest
{
    [JsonProperty("hearing_complexity")]
    public byte? HearingComplexity { get; set; }

    [JsonProperty("hearing_duration")]
    public int? HearingDuration { get; set; }

    [JsonProperty("hearing_prep_time")]
    public int? HearingPrepTime { get; set; }
}