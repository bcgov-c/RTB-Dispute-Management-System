using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class CommonFileResponse : CommonResponse
{
    [JsonProperty("common_file_id")]
    public int CommonFileId { get; set; }

    [JsonProperty("common_file_guid")]
    public Guid CommonFileGuid { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_description")]
    public string FileDescription { get; set; }

    [JsonProperty("file_mime_type")]
    public string FileMimeType { get; set; }

    [JsonProperty("file_name")]
    public string FileName { get; set; }

    [JsonProperty("file_size")]
    public int FileSize { get; set; }

    [JsonProperty("file_path")]
    public string FilePath { get; set; }

    [JsonProperty("file_url")]
    public string FileUrl { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }
}