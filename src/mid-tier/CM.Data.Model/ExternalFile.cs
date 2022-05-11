using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class ExternalFile : BaseEntity
{
    public int ExternalFileId { get; set; }

    public Guid FileGuid { get; set; }

    public int ExternalCustomDataObjectId { get; set; }

    public ExternalCustomDataObject ExternalCustomDataObject { get; set; }

    [StringLength(255)]
    [Required]
    public string OriginalFileName { get; set; }

    public ExternalFileType? FileType { get; set; }

    public ExternalFileType? FileSubType { get; set; }

    public FileStatus? FileStatus { get; set; }

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

    public bool? IsDeleted { get; set; }
}