using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Trial;

public class PostTrialResponse : CommonResponse
{
    [JsonProperty("trial_guid")]
    public Guid TrialGuid { get; set; }

    [JsonProperty("associated_trial_guid")]
    public Guid? AssociatedTrialGuid { get; set; }

    [JsonProperty("opt_in_required")]
    public bool OptinRequired { get; set; }

    [JsonProperty("trial_type")]
    public byte TrialType { get; set; }

    [JsonProperty("trial_sub_type")]
    public byte? TrialSubType { get; set; }

    [JsonProperty("trial_status")]
    public byte? TrialStatus { get; set; }

    [JsonProperty("trial_sub_status")]
    public byte? TrialSubStatus { get; set; }

    [JsonProperty("trial_title")]
    public string TrialTitle { get; set; }

    [JsonProperty("trial_description")]
    public string TrialDescription { get; set; }

    [JsonProperty("min_disputes")]
    public int? MinDisputes { get; set; }

    [JsonProperty("min_participants")]
    public int? MinParticipants { get; set; }

    [JsonProperty("min_interventions")]
    public int? MinInterventions { get; set; }

    [JsonProperty("max_disputes")]
    public int? MaxDisputes { get; set; }

    [JsonProperty("max_participants")]
    public int? MaxParticipants { get; set; }

    [JsonProperty("max_interventions")]
    public int? MaxInterventions { get; set; }

    [JsonProperty("trial_start_date")]
    public string TrialStartDate { get; set; }

    [JsonProperty("trial_end_date")]
    public string TrialEndDate { get; set; }
}