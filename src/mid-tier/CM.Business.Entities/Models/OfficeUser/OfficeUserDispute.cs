using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserDispute
{
    public OfficeUserDispute()
    {
        DisputeFees = new List<OfficeUserDisputeFee>();
        Claims = new List<OfficeUserClaim>();
    }

    [JsonProperty("token_participant_id")]
    public int? TokenParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("migration_source_of_truth")]
    public byte? MigrationSourceOfTruth { get; set; }

    [JsonProperty("current_notice_id")]
    public int? CurrentNoticeId { get; set; }

    [JsonProperty("notice_associated_to")]
    public int? NoticeAssociatedTo { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("initial_payment_date")]
    public string InitialPaymentDate { get; set; }

    [JsonProperty("dispute_status")]
    public byte Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public string LocalStartDateTime { get; set; }

    [JsonProperty("dispute_fees")]
    public List<OfficeUserDisputeFee> DisputeFees { get; set; }

    [JsonProperty("claim_groups")]
    public List<OfficeUserGetDisputeClaimGroup> ClaimGroups { get; set; }

    [JsonProperty("claims")]
    public List<OfficeUserClaim> Claims { get; set; }
}