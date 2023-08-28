using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FileInfoPatchRequest
{
    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_name")]
    public string FileName { get; set; }

    [JsonProperty("file_date")]
    public DateTime? FileDate { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("added_by")]
    public int? AddedBy { get; set; }

    [JsonProperty("file_package_id")]
    public int? FilePackageId { get; set; }

    [JsonProperty("file_considered")]
    public bool? FileConsidered { get; set; }

    [JsonProperty("file_referenced")]
    public bool? FileReferenced { get; set; }

    [StringLength(70)]
    [JsonProperty("submitter_name")]
    public string SubmitterName { get; set; }

    [JsonProperty("is_deficient")]
    public bool IsDeficient { get; set; }

    [JsonProperty("is_source_file_deleted")]
    public bool IsSourceFileDeleted { get; set; }
}