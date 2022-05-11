using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeProcessDetail : BaseEntity
{
    public int DisputeProcessDetailId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int StartDisputeStatusId { get; set; }

    public DisputeStatus DisputeStatus { get; set; }

    public byte AssociatedProcess { get; set; }

    public Participant Participant1 { get; set; }

    public int? ProcessApplicant1Id { get; set; }

    public Participant Participant2 { get; set; }

    public int? ProcessApplicant2Id { get; set; }

    public int? ProcessDuration { get; set; }

    public int? PreparationDuration { get; set; }

    public int? WritingDuration { get; set; }

    public byte? ProcessComplexity { get; set; }

    public byte? ProcessMethod { get; set; }

    public byte? ProcessOutcomeCode { get; set; }

    public byte? ProcessReasonCode { get; set; }

    [StringLength(70)]
    public string ProcessOutcomeTitle { get; set; }

    [StringLength(255)]
    public string ProcessOutcomeDescription { get; set; }

    [StringLength(1000)]
    public string ProcessOutcomeNote { get; set; }

    public bool? IsDeleted { get; set; }
}