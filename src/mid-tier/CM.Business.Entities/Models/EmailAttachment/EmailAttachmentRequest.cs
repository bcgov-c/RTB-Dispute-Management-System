using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailAttachment;

public class EmailAttachmentRequest
{
    [JsonProperty("attachment_type")]
    public AttachmentType AttachmentType { get; set; }

    [JsonProperty("file_id")]
    public int? FileId { get; set; }

    [JsonProperty("common_file_id")]
    public int? CommonFileId { get; set; }
}