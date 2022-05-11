using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ConferenceBridge;

public class ConferenceBridgeRequest
{
    [JsonProperty("bridge_type")]
    public byte? BridgeType { get; set; }

    [JsonProperty("bridge_status")]
    public byte? BridgeStatus { get; set; }

    [StringLength(20)]
    [Required]
    [JsonProperty("dial_in_number1")]
    public string DialInNumber1 { get; set; }

    [StringLength(255)]
    [Required]
    [JsonProperty("dial_in_description1")]
    public string DialInDescription1 { get; set; }

    [StringLength(20)]
    [JsonProperty("dial_in_number2")]
    public string DialInNumber2 { get; set; }

    [StringLength(255)]
    [JsonProperty("dial_in_description2")]
    public string DialInDescription2 { get; set; }

    [StringLength(20)]
    [JsonProperty("dial_in_number3")]
    public string DialInNumber3 { get; set; }

    [StringLength(255)]
    [JsonProperty("dial_in_description3")]
    public string DialInDescription3 { get; set; }

    [JsonProperty("preferred_start_time")]
    public DateTime? PreferredStartTime { get; set; }

    [JsonProperty("preferred_end_time")]
    public DateTime? PreferredEndTime { get; set; }

    [JsonProperty("preferred_owner")]
    public int? PreferredOwner { get; set; }

    [StringLength(20)]
    [JsonProperty("participant_code")]
    public string ParticipantCode { get; set; }

    [StringLength(20)]
    [JsonProperty("moderator_code")]
    public string ModeratorCode { get; set; }

    [StringLength(500)]
    [JsonProperty("special_instructions")]
    public string SpecialInstructions { get; set; }

    [StringLength(15)]
    [JsonProperty("web_portal_login")]
    public string WebPortalLogin { get; set; }

    [StringLength(20)]
    [JsonProperty("record_code")]
    public string RecordCode { get; set; }
}