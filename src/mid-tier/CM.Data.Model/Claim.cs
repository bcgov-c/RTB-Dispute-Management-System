using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Claim : BaseEntity
{
    public int ClaimId { get; set; }

    [Required]
    public int ClaimGroupId { get; set; }

    public ClaimGroup ClaimGroup { get; set; }

    [StringLength(150)]
    public string ClaimTitle { get; set; }

    public byte? ClaimType { get; set; }

    public byte? ClaimCode { get; set; }

    public byte? ClaimStatus { get; set; }

    public byte? ClaimSource { get; set; }

    public byte? ClaimStatusReason { get; set; }

    public virtual ICollection<ClaimDetail> ClaimDetails { get; set; }

    public virtual ICollection<Remedy> Remedies { get; set; }

    public virtual ICollection<FileDescription> FileDescriptions { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }
}