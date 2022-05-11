using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CM.Common.ChunkedFileUpload;

[ModelBinder(BinderType = typeof(UploadFileRequestBinder), Name = "uploadFileRequest")]
public class UploadFileRequest
{
    public Guid FileGuid { get; set; }

    public byte FileType { get; set; }

    public string FileName { get; set; }

    [SwaggerExclude]
    public bool IsChunk { get; set; }

    [SwaggerExclude]
    public int ChunkNumber { get; set; }

    [SwaggerExclude]
    public bool IsFirst { get; set; }

    [SwaggerExclude]
    public bool IsLast { get; set; }

    [SwaggerExclude]
    public IFormFile OriginalFile { get; set; }

    public DateTime? FileDate { get; set; }

    public int? FilePackageId { get; set; }

    [StringLength(70)]
    public string SubmitterName { get; set; }

    public int? AddedBy { get; set; }

    public string FileTitle { get; set; }

    public string FileDescription { get; set; }

    public byte? FileStatus { get; set; }
}