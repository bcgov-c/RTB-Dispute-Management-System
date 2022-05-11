using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialParticipant;

public class PatchTrialParticipantRequest
{
    [JsonProperty("participant_type")]
    public byte ParticipantType { get; set; }

    [JsonProperty("participant_role")]
    public byte ParticipantRole { get; set; }

    [JsonProperty("participant_status")]
    public byte ParticipantStatus { get; set; }

    [JsonProperty("participant_selection_method")]
    public byte? ParticipantSelectionMethod { get; set; }

    [JsonProperty("participant_opted_in")]
    public bool? ParticipantOptedIn { get; set; }

    [JsonProperty("other_participant_title")]
    [StringLength(70)]
    public string OtherParticipantTitle { get; set; }

    [JsonProperty("other_participant_description")]
    [StringLength(255)]
    public string OtherParticipantDescription { get; set; }

    [JsonProperty("start_date")]
    public DateTime? StartDate { get; set; }

    [JsonProperty("end_date")]
    public DateTime? EndDate { get; set; }
}