using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class HearingResponse : CommonResponse
{
    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

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

    [JsonProperty("other_staff_participants")]
    public string OtherStaffParticipants { get; set; }

    [JsonProperty("hearing_method")]
    public byte? HearingMethod { get; set; }

    [JsonProperty("use_custom_schedule")]
    public bool? UseCustomSchedule { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDateTime { get; set; }

    [JsonProperty("hearing_location")]
    public string HearingLocation { get; set; }

    [JsonProperty("use_special_instructions")]
    public bool? UseSpecialInstructions { get; set; }

    [JsonProperty("special_instructions")]
    public string SpecialInstructions { get; set; }

    [JsonProperty("hearing_details")]
    public string HearingDetails { get; set; }

    [JsonProperty("hearing_complexity")]
    public byte? HearingComplexity { get; set; }

    [JsonProperty("hearing_duration")]
    public int? HearingDuration { get; set; }

    [JsonProperty("hearing_note")]
    public string HearingNote { get; set; }

    [JsonIgnore]
    public DateTime? HearingReservedUntil { get; set; }

    [JsonIgnore]
    public int? HearingReservedById { get; set; }

    [JsonProperty("notification_file_description_id")]
    public int? NotificationFileDescriptionId { get; set; }

    [JsonProperty("hearing_reserved_dispute_guid")]
    public Guid? HearingReservedDisputeGuid { get; set; }

    [JsonProperty("hearing_reserved_file_number")]
    public int? HearingReservedFileNumber { get; set; }

    [JsonProperty("notification_delivery_description")]
    public string NotificationDeliveryDescription { get; set; }

    [JsonProperty("notification_delivery_date")]
    public string NotificationDeliveryDate { get; set; }

    [JsonProperty("conference_type")]
    public byte? ConferenceType { get; set; }
}

public class DisputeListHearingResponse : HearingResponse
{
    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("dial_in_description1")]
    public string DialInDescription1 { get; set; }

    [JsonProperty("dial_in_description2")]
    public string DialInDescription2 { get; set; }

    [JsonProperty("dial_in_number1")]
    public string DialInNumber1 { get; set; }

    [JsonProperty("dial_in_number2")]
    public string DialInNumber2 { get; set; }

    [JsonProperty("participant_code")]
    public string ParticipantCode { get; set; }
}