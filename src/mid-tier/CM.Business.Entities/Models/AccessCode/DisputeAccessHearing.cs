using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessHearing
{
    [JsonProperty("hearing_start_date")]
    public string HearingStart { get; set; }

    [JsonProperty("hearing_end_date")]
    public string HearingEnd { get; set; }

    [JsonProperty("hearing_location")]
    public string HearingLocation { get; set; }

    [JsonProperty("primary_dial_in_number")]
    public string PrimaryDialInNumber { get; set; }

    [JsonProperty("primary_dial_in_title")]
    public string PrimaryDialInTitle { get; set; }

    [JsonProperty("secondary_dial_in_number")]
    public string SecondaryDialInNumber { get; set; }

    [JsonProperty("secondary_dial_in_title")]
    public string SecondaryDialInTitle { get; set; }

    [JsonProperty("use_special_instructions")]
    public bool? UseSpecialInstructions { get; set; }

    [JsonProperty("special_instructions")]
    public string SpecialInstructions { get; set; }

    [JsonProperty("hearing_details")]
    public string HearingDetails { get; set; }

    [JsonProperty("participant_dial_code")]
    public string ParticipantDialCode { get; set; }
}