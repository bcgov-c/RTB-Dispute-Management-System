using System;
using System.ComponentModel.DataAnnotations;

namespace DataWarehouseReporting.Data.Models;

public class FactHearingSummary
{
    [Key]
    public int HearingSummaryRecordId { get; set; }

    public DateTime LoadDateTime { get; set; }

    public int AssociatedOffice { get; set; }

    public bool IsActive { get; set; }

    public bool IsPublic { get; set; }

    public Guid? DisputeGuid { get; set; }

    public int HearingId { get; set; }

    public byte? SharedHearingLinkingType { get; set; }

    public byte? LinkedDisputes { get; set; }

    [StringLength(1000)]
    public string SecondaryDisputeGuids { get; set; }

    public DateTime? LocalHearingStartDateTime { get; set; }

    public DateTime? LocalHearingEndDateTime { get; set; }

    public DateTime? HearingStartDateTime { get; set; }

    public DateTime? HearingEndDateTime { get; set; }

    public int? HearingOwner { get; set; }

    public int? HearingPriority { get; set; }

    public int? HearingDuration { get; set; }

    public int? HearingMethod { get; set; }

    public int? HearingType { get; set; }

    public int? HearingParticipations { get; set; }

    public int? HearingAttendingApplicants { get; set; }

    public int? HearingAttendingRespondents { get; set; }

    public int? PrimaryHearings { get; set; }

    public bool? PrimaryAdjourned { get; set; }

    public int? PrimaryPreviousHearingId { get; set; }

    public int? PrimaryLastProcess { get; set; }

    public int? PrimaryLastStage { get; set; }

    public int? PrimaryLastStatus { get; set; }

    public int? PrimaryDisputeType { get; set; }

    public int? PrimaryDisputeSubType { get; set; }

    public int? PrimaryTenancyUnitType { get; set; }

    public int? PrimaryCreationMethod { get; set; }

    public bool? PrimaryTenancyEnded { get; set; }

    public DateTime? PrimaryTenancyEndDateTime { get; set; }

    public int? PrimaryDisputeUrgency { get; set; }

    public DateTime? PrimarySubmittedDateTime { get; set; }

    public DateTime? PrimaryInitialPaymentDateTime { get; set; }

    public int? PrimaryParticipants { get; set; }

    public int? PrimaryApplicants { get; set; }

    public int? PrimaryRespondents { get; set; }

    public int? PrimaryTimeSinceInitialPaymentMin { get; set; }

    public int? PrimaryTimeSinceSubmittedMin { get; set; }

    public int? PrimaryProcesses { get; set; }

    public int? PrimaryStatuses { get; set; }

    public int? PrimarySentEmailMessages { get; set; }

    public int? PrimaryAmendments { get; set; }

    public int? PrimarySubServiceRequests { get; set; }

    public int? PrimaryTotalArbTimeMin { get; set; }

    public int? PrimaryTotalArbOwners { get; set; }

    public int? PrimaryTotalStage6TimeMin { get; set; }

    public int? PrimaryTotalStage8TimeMin { get; set; }

    public int? AllLinkedEvidenceFiles { get; set; }

    public decimal? AllLinkedEvidenceFilesMb { get; set; }

    public int? AllLinkedIssues { get; set; }

    [StringLength(255)]
    public string AllLinkedIssueCodes { get; set; }

    public int? AllLinkedRequestedAmount { get; set; }

    public int? PrimarySubmittedTimeId { get; set; }

    public int? PrimaryInitialPaymentTimeId { get; set; }

    public int? HearingStartDateTimeId { get; set; }

    public int? HearingPrepTime { get; set; }
}