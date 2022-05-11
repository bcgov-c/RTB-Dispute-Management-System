using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class File : BaseEntity
{
    public int FileId { get; set; }

    [Required]
    public Guid FileGuid { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public int? FilePackageId { get; set; }

    public FilePackage FilePackage { get; set; }

    [Required]
    public byte FileType { get; set; }

    [StringLength(255)]
    [Required]
    public string FileMimeType { get; set; }

    [StringLength(255)]
    [Required]
    public string FileName { get; set; }

    public DateTime? FileDate { get; set; }

    public bool? PublicAccessAllowed { get; set; }

    [StringLength(255)]
    [Required]
    public string OriginalFileName { get; set; }

    [Required]
    public long FileSize { get; set; }

    [StringLength(255)]
    [Required]
    public string FilePath { get; set; }

    [StringLength(150)]
    public string FileTitle { get; set; }

    public FileStatus? FileStatus { get; set; }

    public int? AddedBy { get; set; }

    public bool? FileConsidered { get; set; }

    public bool? FileReferenced { get; set; }

    [StringLength(70)]
    public string SubmitterName { get; set; }

    public bool IsDeficient { get; set; }

    public byte? FileOrigin { get; set; }

    public Guid? FileOriginId { get; set; }

    public StorageType Storage { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<LinkedFile> LinkedFiles { get; set; }

    public virtual ICollection<Notice> Notices1 { get; set; }

    public virtual ICollection<Notice> Notices2 { get; set; }

    public virtual ICollection<Notice> Notices3 { get; set; }

    public virtual ICollection<Notice> Notices4 { get; set; }

    public virtual ICollection<Notice> Notices5 { get; set; }

    public virtual ICollection<NoticeService> NoticeServices1 { get; set; }

    public virtual ICollection<NoticeService> NoticeServices2 { get; set; }

    public virtual ICollection<NoticeService> NoticeServices3 { get; set; }

    public virtual ICollection<NoticeService> NoticeServices4 { get; set; }

    public virtual ICollection<NoticeService> NoticeServices5 { get; set; }

    public virtual ICollection<EmailAttachment> EmailAttachments { get; set; }

    public virtual ICollection<OutcomeDocFile> OutcomeDocFiles { get; set; }
}