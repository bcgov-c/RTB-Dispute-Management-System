﻿using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.PostedDecision;

public class PostedDecisionResponse : CommonResponse
{
    public PostedDecisionResponse()
    {
        PostedDecisionOutcomes = new List<PostedDecisionOutcomeResponse>();
    }

    [JsonProperty("posted_file_number")]
    public int PostedDecisionId { get; set; }

    [JsonProperty("dispute_id")]
    public int DisputeId { get; set; }

    [JsonProperty("file_number")]
    public int FileNumber { get; set; }

    [JsonProperty("decision_id")]
    public int DecisionFileId { get; set; }

    [JsonProperty("decision_date")]
    public DateTime DecisionDate { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreatedMethod { get; set; }

    [JsonProperty("initial_payment_method")]
    public byte? InitialPaymentMethod { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("dispute_process")]
    public byte? DisputeProcess { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("tenancy_start")]
    public DateTime? TenancyStartDate { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("tenancy_end")]
    public DateTime? TenancyEndDate { get; set; }

    [JsonProperty("tenancy_city")]
    public string TenancyCity { get; set; }

    [JsonProperty("tenancy_geozone")]
    public byte? TenancyGeozone { get; set; }

    [JsonProperty("application_submitted_date")]
    public DateTime? ApplicationSubmittedDate { get; set; }

    [JsonProperty("original_notice_delivered")]
    public bool? OriginalNoticeDelivered { get; set; }

    [JsonProperty("original_notice_date")]
    public DateTime? OriginalNoticeDate { get; set; }

    [JsonProperty("tenancy_agreement_signed_by")]
    public byte? TenancyAgreementSignedBy { get; set; }

    [JsonProperty("rent_payment_amount")]
    public decimal? RentPaymentAmount { get; set; }

    [JsonProperty("rent_payment_interval")]
    public string RentPaymentInterval { get; set; }

    [JsonProperty("security_deposit_amount")]
    public decimal? SecurityDepositAmount { get; set; }

    [JsonProperty("pet_damage_deposit_amount")]
    public decimal? PetDamageDepositAmount { get; set; }

    [JsonProperty("previous_hearing_linking_type")]
    public byte? PreviousHearingLinkingType { get; set; }

    [JsonProperty("previous_hearing_date")]
    public DateTime? PreviousHearingDate { get; set; }

    [JsonProperty("previous_hearing_process_duration")]
    public int? PreviousHearingProcessDuration { get; set; }

    [JsonProperty("previous_hearing_process_method")]
    public byte? PreviousHearingProcessMethod { get; set; }

    [JsonProperty("applicant_hearing_attendance")]
    public byte? ApplicantHearingAttendance { get; set; }

    [JsonProperty("respondent_hearing_attendance")]
    public byte? RespondentHearingAttendance { get; set; }

    [JsonProperty("associated_process")]
    public byte? AssociateProcessId { get; set; }

    [JsonProperty("associated_process_name")]
    public string AssociatedProcessName { get; set; }

    [JsonProperty("primary_applicant_type")]
    public byte? PrimaryApplicantType { get; set; }

    [JsonProperty("number_applicants")]
    public byte? NumberApplicants { get; set; }

    [JsonProperty("number_respondents")]
    public byte? NumberRespondents { get; set; }

    [JsonProperty("number_individuals")]
    public byte? NumberIndividuals { get; set; }

    [JsonProperty("number_businesses")]
    public byte? NumberBusinesses { get; set; }

    [JsonProperty("number_agents")]
    public byte? NumberAgents { get; set; }

    [JsonProperty("number_advocates")]
    public byte? NumberAdvocates { get; set; }

    [JsonProperty("count_applicant_evidence_files")]
    public int? CountApplicantEvidenceFiles { get; set; }

    [JsonProperty("count_respondent_evidence_files")]
    public int? CountRespondentEvidenceFiles { get; set; }

    [JsonProperty("search_result_summary")]
    public string SearchResultSummary { get; set; }

    [JsonProperty("search_text")]
    public string SearchText { get; set; }

    [JsonProperty("search_tags")]
    public string SearchTags { get; set; }

    [JsonProperty("search_words")]
    public string SearchKeyWords { get; set; }

    [JsonProperty("posting_date")]
    public DateTime? PostingDate { get; set; }

    [JsonProperty("posted_by")]
    public int? PostedBy { get; set; }

    [JsonProperty("posted_decision_outcomes")]
    public List<PostedDecisionOutcomeResponse> PostedDecisionOutcomes { get; set; }
}