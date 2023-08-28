using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class CommonFile : BaseEntity
{
    public int CommonFileId { get; set; }

    public Guid CommonFileGuid { get; set; }

    public CommonFileType? FileType { get; set; }

    [StringLength(100)]
    public string FileTitle { get; set; }

    [StringLength(1000)]
    public string FileDescription { get; set; }

    [StringLength(255)]
    [Required]
    public string FileMimeType { get; set; }

    [StringLength(255)]
    [Required]
    public string FileName { get; set; }

    public long FileSize { get; set; }

    [StringLength(255)]
    [Required]
    public string FilePath { get; set; }

    public byte? FileStatus { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<EmailAttachment> EmailAttachments { get; set; }

    public virtual ICollection<InternalUserProfile> InternalUserProfilesProfilePic { get; set; }

    public virtual ICollection<InternalUserProfile> InternalUserProfilesSignature { get; set; }

    public virtual ICollection<HearingImport> HearingImports { get; set; }
}