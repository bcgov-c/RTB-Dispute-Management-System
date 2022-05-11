using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeFee : BaseEntity
{
    public int DisputeFeeId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public DateTime? DueDate { get; set; }

    public bool IsActive { get; set; }

    public byte? FeeType { get; set; }

    [StringLength(255)]
    public string FeeDescription { get; set; }

    public int? PayorId { get; set; }

    public decimal? AmountDue { get; set; }

    public byte? MethodPaid { get; set; }

    public bool? IsPaid { get; set; }

    public decimal? AmountPaid { get; set; }

    public DateTime? DatePaid { get; set; }

    public bool? IsDeleted { get; set; }

    [StringLength(10)]
    public string PaymentOverrideCode { get; set; }

    public ICollection<PaymentTransaction> PaymentTransactions { get; set; }
}