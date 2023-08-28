using System;

namespace CM.Business.Services.AdHocFileCleanup;

public class FileCleanup
{
    public Guid FileGuid { get; set; }

    public string FileName { get; set; }

    public string FilePath { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsSourceFileDeleted { get; set; }

    public string FileMimeType { get; set; }

    public DateTime? CreatedDate { get; set; }
}