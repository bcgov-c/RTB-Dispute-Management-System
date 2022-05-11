using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeClosedResponse
{
    [JsonProperty("token_participant_id")]
    public int TokenParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("migration_source_of_truth")]
    public byte? MigrationSourceOfTruth { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? DisputeStage { get; set; }

    [JsonProperty("dispute_status")]
    public byte DisputeStatus { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("dispute_process")]
    public byte? DisputeProcess { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("hearings")]
    public List<DisputeAccessHearing> Hearings { get; set; }

    [JsonProperty("claim_groups")]
    public List<DisputeAccessClaimGroup> ClaimGroups { get; set; }
}