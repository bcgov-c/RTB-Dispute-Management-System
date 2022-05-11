using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialOutcome;

public class PostTrialOutcomeResponse : CommonResponse
{
    [JsonProperty("trial_outcome_guid")]
    public Guid TrialOutcomeGuid { get; set; }

    [JsonProperty("trial_guid")]
    public Guid TrialGuid { get; set; }

    [JsonProperty("outcome_by")]
    public byte OutcomeBy { get; set; }

    [JsonProperty("trial_participant_guid")]
    public Guid? TrialParticipantGuid { get; set; }

    [JsonProperty("trial_dispute_guid")]
    public Guid? TrialDisputeGuid { get; set; }

    [JsonProperty("trial_intervention_guid")]
    public Guid TrialInterventionGuid { get; set; }

    [JsonProperty("outcome_type")]
    public byte? OutcomeType { get; set; }

    [JsonProperty("outcome_subtype")]
    public byte? OutcomeSubType { get; set; }

    [JsonProperty("outcome_status")]
    public byte? OutcomeStatus { get; set; }

    [JsonProperty("start_date")]
    public string StartDate { get; set; }

    [JsonProperty("end_date")]
    public string EndDate { get; set; }
}