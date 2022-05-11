using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Business.Entities.Models.Files;

public class FileUploadInfo
{
    [Required]
    public Guid FileGuid { get; set; }

    public byte FileType { get; set; }

    [SwaggerExclude]
    public string FileMimeType { get; set; }

    [Required]
    public string FileName { get; set; }

    [SwaggerExclude]
    public string OriginalFileName { get; set; }

    [SwaggerExclude]
    public long FileSize { get; set; }

    public int? AddedBy { get; set; }

    [SwaggerExclude]
    public string FilePath { get; set; }

    public int? FilePackageId { get; set; }

    [StringLength(70)]
    public string SubmitterName { get; set; }

    public DateTime? FileDate { get; set; }

    [SwaggerExclude]
    public StorageType Storage { get; set; }

    public string FileTitle { get; set; }

    public string FileDescription { get; set; }

    public byte? FileStatus { get; set; }
}