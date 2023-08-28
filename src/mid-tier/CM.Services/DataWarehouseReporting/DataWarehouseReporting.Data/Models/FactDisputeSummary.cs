using System;
using System.ComponentModel.DataAnnotations;

namespace DataWarehouseReporting.Data.Models;

public class FactDisputeSummary
{
    [Key]
    public int DisputeSummaryRecordId { get; set; }

    public DateTime LoadDateTime { get; set; }

    public int AssociatedOffice { get; set; }

    public bool IsActive { get; set; }

    public bool IsPublic { get; set; }

    public Guid DisputeGuid { get; set; }

    public int Participants { get; set; }

    public int AccessCodeUsers { get; set; }

    public int Applicants { get; set; }

    public int Respondents { get; set; }

    public int Issues { get; set; }

    public int AwardedIssues { get; set; }

    public int AwardedAmount { get; set; }

    public int AwardedPossessions { get; set; }

    public int Processes { get; set; }

    public int Statuses { get; set; }

    public int Notes { get; set; }

    public int Tasks { get; set; }

    public int AvgTaskOpenTimeMin { get; set; }

    public int SentEmailMessages { get; set; }

    public int EvidenceOverrides { get; set; }

    public int Hearings { get; set; }

    public int CrossHearings { get; set; }

    public int HearingParticipations { get; set; }

    public int Notices { get; set; }

    public int NoticeServices { get; set; }

    public int Amendments { get; set; }

    public int SubServiceRequests { get; set; }

    public int EvidenceFiles { get; set; }

    public int EvidencePackages { get; set; }

    public int EvidencePackageServices { get; set; }

    public decimal EvidenceFilesMb { get; set; }

    public int DecisionsAndOrders { get; set; }

    public decimal DecisionsAndOrdersMb { get; set; }

    public int AvgDocDeliveryTimeMin { get; set; }

    public int DocumentsDelivered { get; set; }

    public int TotalOpenTimeMin { get; set; }

    public int TotalCitizenStatusTimeMin { get; set; }

    public int TotalIoTimeMin { get; set; }

    public int TotalArbTimeMin { get; set; }

    public DateTime? SubmittedDateTime { get; set; }

    public DateTime? InitialPaymentDateTime { get; set; }

    public byte? InitialPaymentMethod { get; set; }

    public int Payments { get; set; }

    public int Transactions { get; set; }

    public decimal PaymentsAmount { get; set; }

    public DateTime? NoticeDeliveredDateTime { get; set; }

    public DateTime? LastParticipatoryHearingDateTime { get; set; }

    public DateTime LastStatusDateTime { get; set; }

    public byte? DisputeType { get; set; }

    public byte DisputeSubType { get; set; }

    public byte? CreationMethod { get; set; }

    public byte? MigrationSourceOfTruth { get; set; }

    public byte? DisputeUrgency { get; set; }

    public byte? LastStage { get; set; }

    public byte LastStatus { get; set; }

    public byte? LastProcess { get; set; }

    public int? SubmittedTimeId { get; set; }

    public int? PaymentTimeId { get; set; }

    public int? NoticeDeliveredTimeId { get; set; }

    public int? LastParticipatoryHearingTimeId { get; set; }

    public int? LastStatusTimeId { get; set; }

    public int DisputeCityId { get; set; }

    public DateTime CreatedDate { get; set; }

    public bool? TenancyEnded { get; set; }

    public int AwardedMonetaryIssues { get; set; }

    public int RequestedAmount { get; set; }

    public int EvidenceFilesFromApplicant { get; set; }

    public int EvidenceFilesFromRespondent { get; set; }

    public int EvidencePackagesFromApplicant { get; set; }

    public int EvidencePackagesFromRespondent { get; set; }

    public int EvidenceFilesMbFromApplicant { get; set; }

    public int EvidenceFilesMbFromRespondent { get; set; }

    public int DocumentSets { get; set; }

    public int OrdersMonetary { get; set; }

    public int OrdersPossession { get; set; }

    public int DecisionsInterim { get; set; }

    public int TotalIoOwners { get; set; }

    public int TotalArbOwners { get; set; }

    public int TotalStage0TimeMin { get; set; }

    public int TotalStage2TimeMin { get; set; }

    public int TotalStage4TimeMin { get; set; }

    public int TotalStage6TimeMin { get; set; }

    public int TotalStage8TimeMin { get; set; }

    public int TotalStage10TimeMin { get; set; }

    public int TotalStatus22TimeMin { get; set; }

    public int TotalStatus41TimeMin { get; set; }

    public int TotalStatus102TimeMin { get; set; }

    public int TotalHearingTimeMin { get; set; }

    public int TotalHearingPrepTimeMin { get; set; }

    public int TotalWritingTimeMin { get; set; }

    public int IsAdjourned { get; set; }

    public int AmendRemovedParticipants { get; set; }

    public int AmendRemovedIssues { get; set; }

    public DateTime? TenancyEndDate { get; set; }

    public int? TenancyUnitType { get; set; }

    public int? RequestedReviewConsideration { get; set; }

    public int? AwardedReviewConsiderations { get; set; }

    public int? RequestedClarifications { get; set; }

    public int? AwardedClarifications { get; set; }

    public int? RequestedCorrections { get; set; }

    public int? AwardedCorrections { get; set; }

    public DateTime? FirstParticipatoryHearingDateTime { get; set; }

    public int? FirstParticipatoryHearingDateTimeId { get; set; }

    public int? DisputeComplexity { get; set; }

    public DateTime? FirstDecisionDateTime { get; set; }

    public int? FirstDecisionDateTimeId { get; set; }

    public int? NoticeNotServed { get; set; }

    public int? CaseManagedTimeMin { get; set; }

    public bool? IsMissingResolutionTime { get; set; }

    public bool? RequestedPossession { get; set; }

    public bool? IsMissingIssueOutcomes { get; set; }

    public bool? IsMissingNoticeService { get; set; }
}