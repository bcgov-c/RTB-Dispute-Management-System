using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class OutcomeDocDelivery : BaseEntity
{
    public int OutcomeDocDeliveryId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int OutcomeDocFileId { get; set; }

    public OutcomeDocFile OutcomeDocFile { get; set; }

    public int? ParticipantId { get; set; }

    public Participant Participant { get; set; }

    public byte? DeliveryMethod { get; set; }

    public byte? DeliveryPriority { get; set; }

    [StringLength(500)]
    public string DeliveryComment { get; set; }

    public bool? IsDelivered { get; set; }

    public DateTime? DeliveryDate { get; set; }

    public bool? ReadyForDelivery { get; set; }

    public DateTime? ReadyForDeliveryDate { get; set; }

    public bool? ConfirmedReceived { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public bool? IsDeleted { get; set; }

    public int? AssociatedEmailId { get; set; }

    public EmailMessage AssociatedEmail { get; set; }
}