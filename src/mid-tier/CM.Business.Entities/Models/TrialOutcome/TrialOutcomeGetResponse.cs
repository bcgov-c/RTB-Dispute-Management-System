using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialOutcome;

public class TrialOutcomeGetResponse : CommonResponse
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

    [JsonProperty("outcome_title")]
    public string OutcomeTitle { get; set; }

    [JsonProperty("outcome_value1")]
    public int? OutcomeValue1 { get; set; }

    [JsonProperty("outcome_value2")]
    public int? OutcomeValue2 { get; set; }

    [JsonProperty("outcome_value3")]
    public int? OutcomeValue3 { get; set; }

    [JsonProperty("outcome_value4")]
    public int? OutcomeValue4 { get; set; }

    [JsonProperty("outcome_string1")]
    public string OutcomeString1 { get; set; }

    [JsonProperty("outcome_string2")]
    public string OutcomeString2 { get; set; }

    [JsonProperty("outcome_string3")]
    public string OutcomeString3 { get; set; }

    [JsonProperty("outcome_json")]
    public string OutcomeJson { get; set; }

    [JsonProperty("outcome_comment")]
    public string OutcomeComment { get; set; }

    [JsonProperty("start_date")]
    public string StartDate { get; set; }

    [JsonProperty("end_date")]
    public string EndDate { get; set; }
}