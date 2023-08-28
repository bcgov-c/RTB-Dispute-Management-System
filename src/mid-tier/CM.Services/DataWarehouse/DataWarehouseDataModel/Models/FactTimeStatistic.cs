using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

public class FactTimeStatistic
{
    [Key]
    public int DisputeSummaryRecordId { get; set; }

    public DateTime LoadDateTime { get; set; }

    public int AssociatedOffice { get; set; }

    public bool IsActive { get; set; }

    public bool IsPublic { get; set; }

    public byte StatisticsType { get; set; }

    public DateTime AssociatedDate { get; set; }

    public int AssociatedDateId { get; set; }

    public int OpenFiles { get; set; }

    public int IntakePayments { get; set; }

    public int ReviewPayments { get; set; }

    public int PerUnitPayments { get; set; }

    public int OnlineDisputesPaid { get; set; }

    public int OfficeDisputesPaid { get; set; }

    public int Process1DisputesPaid { get; set; }

    public int Process2DisputesPaid { get; set; }

    public int? Process7DisputesPaid { get; set; }

    public int TenantDisputesPaid { get; set; }

    public int LandlordDisputesPaid { get; set; }

    public int EmergencyDisputesPaid { get; set; }

    public int StandardDisputesPaid { get; set; }

    public int DeferredDisputesPaid { get; set; }

    public int? NoUrgencyDisputesPaid { get; set; }

    public int SubServicesSubmitted { get; set; }

    public int AmendmentsSubmitted { get; set; }

    public int DisputeHearings { get; set; }

    public int? DisputeHearingsEmergency { get; set; }

    public int? DisputeHearingsStandard { get; set; }

    public int? DisputeHearingsDeferred { get; set; }

    public int? DisputeHearingsDuty { get; set; }

    public int EmptyHearings { get; set; }

    public int? EmptyHearingsEmergency { get; set; }

    public int? EmptyHearingsStandard { get; set; }

    public int? EmptyHearingsDeferred { get; set; }

    public int? EmptyHearingsDuty { get; set; }

    public decimal AvgNext10EmergEmptyHearingDays { get; set; }

    public decimal AvgNext10StandardEmptyHearingDays { get; set; }

    public decimal AvgNext10DeferredEmptyHearingDays { get; set; }

    public int Files { get; set; }

    public int FilesMb { get; set; }

    public int EvidenceFiles { get; set; }

    public int EvidenceFilesMb { get; set; }

    public int StatusWaitingProofService { get; set; }

    public int StatusAbandonedNeedsUpdate { get; set; }

    public int StatusAbandonedNoService { get; set; }

    public int StatusCancelled { get; set; }

    public int StatusNeedsUpdate { get; set; }

    public int StatusWithdrawn { get; set; }

    public int StatusWaitingForDecision { get; set; }

    public DateTime StatusWaitingForDecisionOldest { get; set; }

    public int CorrectionRequests { get; set; }

    public int ClarificationRequests { get; set; }

    public int ReviewRequests { get; set; }

    public int StatusClosed { get; set; }

    public int Stage0Open { get; set; }

    public int Stage2Open { get; set; }

    public int Stage4Open { get; set; }

    public int Stage6Open { get; set; }

    public int Stage8Open { get; set; }

    public int Stage10Open { get; set; }

    public int Stage2Unassigned { get; set; }

    public DateTime Stage2UnassignedOldest { get; set; }

    public int Stage2Assigned { get; set; }

    public DateTime Stage2AssignedOldest { get; set; }

    public int StatusRescheduledUnassigned { get; set; }

    public int StatusRescheduledAssigned { get; set; }

    public int IoIncompleteTasksUnassigned { get; set; }

    public DateTime IoIncompleteTasksUnassignedOldest { get; set; }

    public int IoIncompleteTasksAssigned { get; set; }

    public int IoTasksCompleted { get; set; }

    public int ArbIncompleteTasksAssigned { get; set; }

    public int ArbIncompleteTasksUnassigned { get; set; }

    public DateTime ArbIncompleteTasksUnassignedOldest { get; set; }

    public int ArbTasksCompleted { get; set; }

    public int OtherIncompleteTasks { get; set; }

    public int DocumentsUndelivered { get; set; }

    public DateTime DocumentsUndeliveredOldest { get; set; }

    public int DocumentsUndeliveredUrgent { get; set; }

    public DateTime DocumentsUndeliveredUrgentOldest { get; set; }

    public int DocumentsDelivered { get; set; }

    public int? IntakeProcessed { get; set; }

    public int? Stage2UnassignedDeferred { get; set; }

    public int? Stage2UnassignedStandard { get; set; }

    public int? Stage2UnassignedUrgent { get; set; }

    public int? WaitTimeDaysDeferred { get; set; }

    public int? WaitTimeDaysStandard { get; set; }

    public int? WaitTimeDaysUrgent { get; set; }

    public int? NonParticipatoryWaitingDecision { get; set; }

    public DateTime? NonParticipatoryWaitingDecisionOldest { get; set; }

    public int? NonParticipatoryClosed { get; set; }

    public int? StatusAdjourned { get; set; }

    public int? ParticipatoryWaitArsDeadline { get; set; }

    public int? ParticipatoryMissArsDeadline { get; set; }

    public int? ParticipatoryWaitReinstateDeadline { get; set; }

    public int? ParticipatoryMissReinstateDeadline { get; set; }
}