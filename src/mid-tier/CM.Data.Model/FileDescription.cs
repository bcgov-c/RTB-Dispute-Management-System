using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class FileDescription : BaseEntity
{
    public int FileDescriptionId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid DisputeGuid { get; set; }

    public Claim Claim { get; set; }

    public int? ClaimId { get; set; }

    public Remedy Remedy { get; set; }

    public int? RemedyId { get; set; }

    [StringLength(100)]
    public string Title { get; set; }

    [StringLength(750)]
    public string Description { get; set; }

    [ForeignKey("DescriptionBy")]
    public Participant Participant { get; set; }

    public int? DescriptionBy { get; set; }

    public byte DescriptionCategory { get; set; }

    public byte? DescriptionCode { get; set; }

    public byte? FileMethod { get; set; }

    public bool? Discussed { get; set; }

    public byte? DecisionReference { get; set; }

    public FileStatus? FileStatus { get; set; }

    public bool IsDeficient { get; set; }

    [StringLength(255)]
    public string IsDeficientReason { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<LinkedFile> LinkedFiles { get; set; }

    public virtual ICollection<Notice> Notices { get; set; }

    public virtual ICollection<NoticeService> NoticeServices { get; set; }

    public virtual ICollection<Amendment> Amendments { get; set; }
}