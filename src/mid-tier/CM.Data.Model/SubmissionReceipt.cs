using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class SubmissionReceipt : BaseEntity
{
    public int SubmissionReceiptId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int ParticipantId { get; set; }

    public byte ReceiptType { get; set; }

    public byte? ReceiptSubType { get; set; }

    [StringLength(100)]
    public string ReceiptTitle { get; set; }

    public string ReceiptBody { get; set; }

    public DateTime? ReceiptDate { get; set; }

    public bool? ReceiptPrinted { get; set; }

    public bool? ReceiptEmailed { get; set; }

    public bool? IsDeleted { get; set; }
}