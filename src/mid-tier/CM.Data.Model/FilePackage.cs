using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class FilePackage : BaseEntity
{
    public int FilePackageId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid DisputeGuid { get; set; }

    public int? CreatedById { get; set; }

    public Participant CreatedParticipant { get; set; }

    [StringLength(10)]
    public string CreatedByAccessCode { get; set; }

    [StringLength(100)]
    public string PackageTitle { get; set; }

    [StringLength(10000)]
    public string PackageDescription { get; set; }

    public byte? PackageType { get; set; }

    public DateTime? PackageDate { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<File> Files { get; set; }

    public virtual ICollection<FilePackageService> FilePackageServices { get; set; }
}