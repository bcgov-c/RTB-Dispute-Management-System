using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class ClaimDetail : BaseEntity
{
    public int ClaimDetailId { get; set; }

    [StringLength(1000)]
    public string Description { get; set; }

    public int? ClaimId { get; set; }

    public Claim Claim { get; set; }

    public int DescriptionBy { get; set; }

    public Participant Participant { get; set; }

    public DateTime? NoticeDate { get; set; }

    public byte? NoticeMethod { get; set; }

    [StringLength(255)]
    public string WhenAware { get; set; }

    [StringLength(255)]
    public string Location { get; set; }

    [StringLength(750)]
    public string Impact { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }

    public byte? PositionStatus { get; set; }
}