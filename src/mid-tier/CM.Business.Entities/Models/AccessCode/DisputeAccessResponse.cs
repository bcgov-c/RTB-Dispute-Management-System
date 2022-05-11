using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessResponse
{
    public DisputeAccessResponse()
    {
        Claims = new List<DisputeAccessClaim>();
        DisputeFees = new List<DisputeAccessDisputeFee>();
        NoticeServices = new List<DisputeAccessNoticeService>();
        UnlinkedFileDescriptions = new List<DisputeAccessFileDescription>();
        OutcomeDocGroups = new List<DisputeOutcomeDocGroupResponse>();
        OutcomeDocRequests = new List<DisputeOutcomeDocRequestsResponse>();
        PickupMessages = new List<PickupMessage>();
        LinkedDisputeFlags = new List<PostDisputeFlagResponse>();
        HearingParticipations = new List<DisputeAccessHearingParticipation>();
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

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? DisputeStage { get; set; }

    [JsonProperty("dispute_status")]
    public byte DisputeStatus { get; set; }

    [JsonProperty("dispute_process")]
    public byte? DisputeProcess { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("initial_payment_date")]
    public string InitialPaymentDate { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public string LocalStartDateTime { get; set; }

    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("dispute_hearing_id")]
    public int DisputeHearingId { get; set; }

    [JsonProperty("dispute_hearing_role")]
    public byte DisputeHearingRole { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("claim_groups")]
    public List<DisputeAccessClaimGroup> ClaimGroups { get; set; }

    [JsonProperty("claims")]
    public List<DisputeAccessClaim> Claims { get; set; }

    [JsonProperty("dispute_fees")]
    public List<DisputeAccessDisputeFee> DisputeFees { get; set; }

    [JsonProperty("notice_services")]
    public List<DisputeAccessNoticeService> NoticeServices { get; set; }

    [JsonProperty("unlinked_file_description")]
    public List<DisputeAccessFileDescription> UnlinkedFileDescriptions { get; set; }

    [JsonProperty("outcome_doc_groups")]
    public List<DisputeOutcomeDocGroupResponse> OutcomeDocGroups { get; set; }

    [JsonProperty("outcome_doc_requests")]
    public List<DisputeOutcomeDocRequestsResponse> OutcomeDocRequests { get; set; }

    [JsonProperty("pickup_messages")]
    public List<PickupMessage> PickupMessages { get; set; }

    [JsonProperty("linked_dispute_flags")]
    public List<PostDisputeFlagResponse> LinkedDisputeFlags { get; set; }

    [JsonProperty("hearing_participations")]
    public List<DisputeAccessHearingParticipation> HearingParticipations { get; set; }
}