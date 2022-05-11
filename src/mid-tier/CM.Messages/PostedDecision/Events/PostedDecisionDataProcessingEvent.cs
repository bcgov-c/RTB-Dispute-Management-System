using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Messages.PostedDecision.Events;

public class PostedDecisionDataProcessingEvent : BaseMessage
{
    public PostedDecisionDataProcessingEvent()
    {
        CorrelationGuid = Guid.NewGuid();
        PostedDecisionOutcomeEvents = new List<PostedDecisionOutcomeEvent>();
    }

    public int DisputeId { get; set; }

    public int FileNumber { get; set; }

    public int DecisionFileId { get; set; }

    [Required]
    public DateTime DecisionDate { get; set; }

    public byte? CreatedMethod { get; set; }

    public byte? InitialPaymentMethod { get; set; }

    public byte? DisputeType { get; set; }

    public byte? DisputeSubType { get; set; }

    public byte? DisputeProcess { get; set; }

    public byte? DisputeUrgency { get; set; }

    public DateTime? TenancyStartDate { get; set; }

    public byte? TenancyEnded { get; set; }

    public DateTime? TenancyEndDate { get; set; }

    [StringLength(50)]
    public string TenancyCity { get; set; }

    public byte? TenancyGeozone { get; set; }

    public DateTime? ApplicationSubmittedDate { get; set; }

    public bool? OriginalNoticeDelivered { get; set; }

    public DateTime? OriginalNoticeDate { get; set; }

    public byte? TenancyAgreementSignedBy { get; set; }

    public decimal? RentPaymentAmount { get; set; }

    public string RentPaymentInterval { get; set; }

    public decimal? SecurityDepositAmount { get; set; }

    public decimal? PetDamageDepositAmount { get; set; }

    public byte? PreviousHearingLinkingType { get; set; }

    public DateTime? PreviousHearingDate { get; set; }

    public int? PreviousHearingProcessDuration { get; set; }

    public byte? PreviousHearingProcessMethod { get; set; }

    public byte? ApplicantHearingAttendance { get; set; }

    public byte? RespondentHearingAttendance { get; set; }

    public byte? AssociateProcessId { get; set; }

    [StringLength(100)]
    public string AssociatedProcessName { get; set; }

    public byte? PrimaryApplicantType { get; set; }

    public byte? NumberApplicants { get; set; }

    public byte? NumberRespondents { get; set; }

    public byte? NumberIndividuals { get; set; }

    public byte? NumberBusinesses { get; set; }

    public byte? NumberAgents { get; set; }

    public byte? NumberAdvocates { get; set; }

    public int? CountApplicantEvidenceFiles { get; set; }

    public int? CountRespondentEvidenceFiles { get; set; }

    [StringLength(750)]
    public string SearchResultSummary { get; set; }

    public string SearchText { get; set; }

    [StringLength(255)]
    public string SearchTags { get; set; }

    [StringLength(255)]
    public string SearchKeyWords { get; set; }

    public DateTime? PostingDate { get; set; }

    public int? PostedBy { get; set; }

    public bool? NoteWorthy { get; set; }

    public string FilePath { get; set; }

    [StringLength(500)]
    public string BusinessNames { get; set; }

    public bool? MateriallyDifferent { get; set; }

    public string AnonDecisionId { get; set; }

    public IList<PostedDecisionOutcomeEvent> PostedDecisionOutcomeEvents { get; set; }
}