using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialIntervention;

public class PostTrialInterventionRequest
{
    [JsonProperty("trial_dispute_guid")]
    public Guid? TrialDisputeGuid { get; set; }

    [JsonProperty("trial_participant_guid")]
    public Guid? TrialParticipantGuid { get; set; }

    [JsonProperty("other_associated_id")]
    public int? OtherAssociatedId { get; set; }

    [JsonProperty("intervention_selection_method")]
    public byte? InterventionSelectionMethod { get; set; }

    [JsonProperty("intervention_type")]
    public byte InterventionType { get; set; }

    [JsonProperty("intervention_subtype")]
    public byte? InterventionSubType { get; set; }

    [JsonProperty("intervention_status")]
    public byte InterventionStatus { get; set; }

    [JsonProperty("intervention_title")]
    public string InterventionTitle { get; set; }

    [JsonProperty("intervention_description")]
    public string InterventionDescription { get; set; }

    [JsonProperty("start_date")]
    public DateTime? StartDate { get; set; }

    [JsonProperty("end_date")]
    public DateTime? EndDate { get; set; }
}