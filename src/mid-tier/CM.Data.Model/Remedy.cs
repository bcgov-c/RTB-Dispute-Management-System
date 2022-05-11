using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Remedy : BaseEntity
{
    public int RemedyId { get; set; }

    public int ClaimId { get; set; }

    public Claim Claim { get; set; }

    [StringLength(150)]
    public string RemedyTitle { get; set; }

    public byte? RemedyStatus { get; set; }

    public byte? RemedyType { get; set; }

    public byte? RemedySource { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }

    public byte? RemedySubStatus { get; set; }

    [StringLength(255)]
    public string RemedyStatusReason { get; set; }

    public byte? RemedyStatusReasonCode { get; set; }

    public decimal? AwardedAmount { get; set; }

    public DateTime? AwardedDate { get; set; }

    public int? AwardedDaysAfterService { get; set; }

    [StringLength(255)]
    public string AwardDetails { get; set; }

    public bool? IsReviewed { get; set; }

    public byte? PrevRemedyStatus { get; set; }

    public byte? PrevRemedySubStatus { get; set; }

    public decimal? PrevAwardedAmount { get; set; }

    public DateTime? PrevAwardedDate { get; set; }

    public int? PrevAwardedDaysAfterService { get; set; }

    public string PrevAwardDetails { get; set; }

    public int? PrevAwardBy { get; set; }

    public DateTime? PrevAwardDate { get; set; }

    public byte? PrevRemedyStatusReason { get; set; }

    public byte? PrevRemedyStatusReasonCode { get; set; }

    public virtual ICollection<RemedyDetail> RemedyDetails { get; set; }

    public virtual ICollection<FileDescription> FileDescriptions { get; set; }
}