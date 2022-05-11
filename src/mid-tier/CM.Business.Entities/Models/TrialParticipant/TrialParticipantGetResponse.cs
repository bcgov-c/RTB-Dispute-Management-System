using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialParticipant;

public class TrialParticipantGetResponse : CommonResponse
{
    [JsonProperty("trial_participant_guid")]
    public Guid TrialParticipantGuid { get; set; }

    [JsonProperty("trial_guid")]
    public Guid TrialGuid { get; set; }

    [JsonProperty("participant_type")]
    public byte ParticipantType { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("system_user_id")]
    public int? SystemUserId { get; set; }

    [JsonProperty("participant_role")]
    public byte ParticipantRole { get; set; }

    [JsonProperty("participant_status")]
    public byte ParticipantStatus { get; set; }

    [JsonProperty("participant_selection_method")]
    public byte? ParticipantSelectionMethod { get; set; }

    [JsonProperty("participant_opted_in")]
    public bool? ParticipantOptedIn { get; set; }

    [JsonProperty("start_date")]
    public string StartDate { get; set; }

    [JsonProperty("end_date")]
    public string EndDate { get; set; }
}