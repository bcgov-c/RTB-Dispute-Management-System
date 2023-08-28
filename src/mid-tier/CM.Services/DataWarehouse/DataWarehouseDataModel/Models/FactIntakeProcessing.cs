using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

public class FactIntakeProcessing
{
    [Key]
    public int IntakeProcessingRecordId { get; set; }

    public DateTime LoadDateTime { get; set; }

    public int AssociatedOffice { get; set; }

    public bool IsActive { get; set; }

    public bool IsPublic { get; set; }

    public Guid? DisputeGuid { get; set; }

    public int? ProcessStartDisputeStatusId { get; set; }

    public DateTime? ProcessStartDateTime { get; set; }

    public int? ProcessStartProcess { get; set; }

    public int? ProcessEndDisputeStatusId { get; set; }

    public DateTime? ProcessEndDateTime { get; set; }

    public int? ProcessEndStage { get; set; }

    public int? ProcessEndStatus { get; set; }

    public int? ProcessEndProcess { get; set; }

    public int? UnassignedStage2TimeMin { get; set; }

    public int? TimeIoAssignedMin { get; set; }

    public int? TimeTotalProcessingMin { get; set; }

    public int? ConfirmingInfoStatusTimeMin { get; set; }

    public int? ProcessDecReqStatusTimeMin { get; set; }

    public int? ProcessDecReqStatusAssignedTimeMin { get; set; }

    public int? ScreenDecReqStatusTimeMin { get; set; }

    public int? ScreenDecReqStatusAssignedTimeMin { get; set; }

    public int? FirstAssignedDisputeStatusId { get; set; }

    public DateTime? FirstAssignedDateTime { get; set; }

    public int? FirstAssignedStatus { get; set; }

    public int? FirstAssignedOwner { get; set; }

    public int? LastAssignedDisputeStatusId { get; set; }

    public DateTime? LastAssignedDateTime { get; set; }

    public int? LastAssignedStatus { get; set; }

    public int? LastAssignedOwner { get; set; }

    public int? ProcessingOwners { get; set; }

    [StringLength(75)]
    public string ProcessingOwnersList { get; set; }

    public bool? IntakeWasUpdated { get; set; }

    public int? TimeStatusNeedsUpdateMin { get; set; }

    public int? DisputeType { get; set; }

    public int? DisputeSubType { get; set; }

    public int? TenancyUnitType { get; set; }

    public int? DisputeUrgency { get; set; }

    public int? CreationMethod { get; set; }

    public int? DisputeComplexity { get; set; }

    public bool? TenancyEnded { get; set; }

    public DateTime? TenancyEndDateTime { get; set; }

    public DateTime? SubmittedDateTime { get; set; }

    public int? InitialPaymentMethod { get; set; }

    public DateTime? InitialPaymentDateTime { get; set; }

    public int? SharedHearingLinkingType { get; set; }

    public int? DisputeHearingRole { get; set; }

    public int? LinkedDisputes { get; set; }

    public DateTime? HearingStartDateTime { get; set; }

    public int? Participants { get; set; }

    public int? Applicants { get; set; }

    public int? Respondents { get; set; }

    public int? Issues { get; set; }

    public int? Processes { get; set; }

    public int? Statuses { get; set; }

    public int? EvidenceFiles { get; set; }

    public int? EvidenceFilesMb { get; set; }

    public int? SubServiceRequests { get; set; }

    public int? ProcessStartStage { get; set; }

    public int? ProcessStartStatus { get; set; }

    public bool? HasArsDeadline { get; set; }
}