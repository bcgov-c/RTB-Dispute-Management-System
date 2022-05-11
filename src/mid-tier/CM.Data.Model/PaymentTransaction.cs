using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class PaymentTransaction : BaseEntity
{
    public int PaymentTransactionId { get; set; }

    public DisputeFee DisputeFee { get; set; }

    [Required]
    public int DisputeFeeId { get; set; }

    public byte? TransactionSiteSource { get; set; }

    [Required]
    public byte TransactionMethod { get; set; }

    [StringLength(50)]
    public string OfficePaymentIdir { get; set; }

    [StringLength(255)]
    public string PaymentNote { get; set; }

    public Participant Participant { get; set; }

    public int? TransactionBy { get; set; }

    public decimal? TransactionAmount { get; set; }

    public byte? PaymentStatus { get; set; }

    public byte? FeeWaiverTenantsFamily { get; set; }

    public decimal? FeeWaiverIncome { get; set; }

    public byte? FeeWaiverCitySize { get; set; }

    public bool? FeeWaiverHardship { get; set; }

    [StringLength(255)]
    public string FeeWaiverHardshipDetails { get; set; }

    [StringLength(1000)]
    public string PaymentUrl { get; set; }

    public string CardType { get; set; }

    public DateTime? TrnReqDate { get; set; }

    [Required]
    public bool TrnApproved { get; set; }

    public DateTime? TrnDate { get; set; }

    [StringLength(10)]
    public string TrnId { get; set; }

    [StringLength(3)]
    public string TrnType { get; set; }

    [DefaultValue(0)]
    public byte? PaymentVerified { get; set; }

    public byte? PaymentVerifyRetries { get; set; }

    [StringLength(100)]
    public string DisplayMsg { get; set; }

    public int? TrnResponse { get; set; }

    public byte? PaymentProvider { get; set; }

    public byte? ReconcileStatus { get; set; }

    public DateTime? ReconcileDate { get; set; }

    public bool? IsDeleted { get; set; }
}