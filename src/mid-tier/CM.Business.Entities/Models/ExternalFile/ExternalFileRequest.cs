﻿using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalFile;

public class ExternalFileRequest
{
    [JsonProperty("file_id")]
    public int FileId { get; set; }

    [JsonProperty("external_file_guid")]
    public Guid FileGuid { get; set; }

    [JsonProperty("external_custom_data_object_id")]
    public int ExternalCustomDataObjectId { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_mime_type")]
    public string FileMimeType { get; set; }

    [JsonProperty("file_name")]
    public string FileName { get; set; }

    [JsonProperty("original_file_name")]
    public string OriginalFileName { get; set; }

    [JsonProperty("file_size")]
    public long FileSize { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_description")]
    public string FileDescription { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("added_by")]
    public int? AddedBy { get; set; }

    [JsonProperty("file_url")]
    public string FileUrl { get; set; }

    [JsonProperty("file_path")]
    public string FilePath { get; set; }
}