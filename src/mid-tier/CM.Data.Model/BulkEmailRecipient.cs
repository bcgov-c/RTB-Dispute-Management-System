using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class BulkEmailRecipient : BaseEntity
{
    public int BulkEmailRecipientId { get; set; }

    public int BulkEmailBatchId { get; set; }

    public Guid AssociatedDisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int AssociatedFileNumber { get; set; }

    [StringLength(100)]
    public string RecipientEmailAddress { get; set; }

    public int? RecipientParticipantId { get; set; }

    public Participant RecipientParticipant { get; set; }

    public DateTime? PreferredSendDate { get; set; }

    public bool? IsDeleted { get; set; }
}