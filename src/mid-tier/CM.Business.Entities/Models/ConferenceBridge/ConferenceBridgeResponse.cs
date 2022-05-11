using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ConferenceBridge;

public class ConferenceBridgeResponse : CommonResponse
{
    [JsonProperty("conference_bridge_id")]
    public int ConferenceBridgeId { get; set; }

    [JsonProperty("bridge_type")]
    public byte? BridgeType { get; set; }

    [JsonProperty("bridge_status")]
    public byte? BridgeStatus { get; set; }

    [JsonProperty("dial_in_number1")]
    public string DialInNumber1 { get; set; }

    [JsonProperty("dial_in_description1")]
    public string DialInDescription1 { get; set; }

    [JsonProperty("dial_in_number2")]
    public string DialInNumber2 { get; set; }

    [JsonProperty("dial_in_description2")]
    public string DialInDescription2 { get; set; }

    [StringLength(20)]
    [JsonProperty("dial_in_number3")]
    public string DialInNumber3 { get; set; }

    [JsonProperty("dial_in_description3")]
    public string DialInDescription3 { get; set; }

    [JsonProperty("preferred_start_time")]
    public string PreferredStartTime { get; set; }

    [JsonProperty("preferred_end_time")]
    public string PreferredEndTime { get; set; }

    [JsonProperty("preferred_owner")]
    public int? PreferredOwner { get; set; }

    [JsonProperty("participant_code")]
    public string ParticipantCode { get; set; }

    [JsonProperty("moderator_code")]
    public string ModeratorCode { get; set; }

    [JsonProperty("special_instructions")]
    public string SpecialInstructions { get; set; }

    [JsonProperty("web_portal_login")]
    public string WebPortalLogin { get; set; }

    [JsonProperty("record_code")]
    public string RecordCode { get; set; }
}