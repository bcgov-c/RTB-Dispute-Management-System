using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionResponse
{
    public PostedDecisionResponse()
    {
        PostedDecisionOutcomes = new List<PostedDecisionOutcomeResponse>();
    }

    [JsonIgnore]
    public int DisputeId { get; set; }

    [JsonProperty("decision_date")]
    public string DecisionDate { get; set; }

    [JsonProperty("file_url")]
    public string FileUrl { get; set; }

    [JsonIgnore]
    public string UrlExpirationDate { get; set; }

    [JsonIgnore]
    public string FilePath { get; set; }

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
    public string TenancyStartDate { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("tenancy_end")]
    public string TenancyEndDate { get; set; }

    [JsonIgnore]
    public string TenancyCity { get; set; }

    [JsonProperty("application_submitted_date")]
    public string ApplicationSubmittedDate { get; set; }

    [JsonProperty("previous_hearing_linking_type")]
    public byte? PreviousHearingLinkingType { get; set; }

    [JsonProperty("previous_hearing_date")]
    public DateTime? PreviousHearingDate { get; set; }

    [JsonProperty("applicant_hearing_attendance")]
    public byte? ApplicantHearingAttendance { get; set; }

    [JsonProperty("respondent_hearing_attendance")]
    public byte? RespondentHearingAttendance { get; set; }

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

    [JsonProperty("posting_date")]
    public string PostingDate { get; set; }

    [JsonProperty("note_worthy")]
    public bool? NoteWorthy { get; set; }

    [JsonProperty("materially_different")]
    public bool? MateriallyDifferent { get; set; }

    [JsonProperty("anon_decision_id")]
    public string AnonDecisionId { get; set; }

    [JsonProperty("business_names")]
    public string BusinessNames { get; set; }

    [JsonProperty("posted_decision_outcomes")]
    public List<PostedDecisionOutcomeResponse> PostedDecisionOutcomes { get; set; }
}