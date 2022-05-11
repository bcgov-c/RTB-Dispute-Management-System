using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.TrialDispute;

public class PostTrialDisputeResponse : CommonResponse
{
    [JsonProperty("trial_dispute_guid")]
    public Guid TrialDisputeGuid { get; set; }

    [JsonProperty("trial_guid")]
    public Guid TrialGuid { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("dispute_role")]
    public byte DisputeRole { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_trial_status")]
    public byte DisputeTrialStatus { get; set; }

    [JsonProperty("dispute_selection_method")]
    public byte? DisputeSelectionMethod { get; set; }

    [JsonProperty("dispute_opted_in")]
    public bool? DisputeOptedIn { get; set; }

    [JsonProperty("dispute_opted_in_by_participant_id")]
    public int? DisputeOptedInByParticipantId { get; set; }

    [JsonProperty("dispute_opted_in_by_staff_id")]
    public int? DisputeOptedInByStaffId { get; set; }

    [JsonProperty("start_date")]
    public string StartDate { get; set; }

    [JsonProperty("end_date")]
    public string EndDate { get; set; }
}