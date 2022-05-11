using System;
using System.IO;

namespace CM.FileSystem.Service;

public class StoreFileRequest
{
    public byte FileType { get; set; }

    public string FileName { get; set; }

    public string OriginalFileName { get; set; }

    public FileInfo FileInfo { get; set; }

    public string MimeType { get; set; }

    public DateTime? FileDate { get; set; }

    public int? FilePackageId { get; set; }

    public string SubmitterName { get; set; }

    public int? AddedBy { get; set; }
}