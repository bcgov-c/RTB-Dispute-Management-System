using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage;

public class PickupEmailAttachmentResponse : CommonResponse
{
    [JsonProperty("email_attachment_id")]
    public int EmailAttachmentId { get; set; }

    [JsonProperty("attachment_type")]
    public byte AttachmentType { get; set; }

    [JsonProperty("file_id")]
    public int? FileId { get; set; }

    [JsonProperty("common_file_id")]
    public int? CommonFileId { get; set; }

    [JsonProperty("common_file_guid")]
    public Guid? CommonFileGuid { get; set; }

    [JsonProperty("file_guid")]
    public Guid? FileGuid { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_mime_type")]
    public string FileMimeType { get; set; }

    [JsonProperty("file_name")]
    public string FileName { get; set; }

    [JsonProperty("file_size")]
    public long FileSize { get; set; }

    [JsonProperty("file_url")]
    public string FileUrl { get; set; }
}