using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailAttachment;

public class EmailAttachmentResponse : CommonResponse
{
    [JsonProperty("email_attachment_id")]
    public int EmailAttachmentId { get; set; }

    [JsonProperty("email_id")]
    public int EmailMessageId { get; set; }

    [JsonProperty("attachment_type")]
    public byte AttachmentType { get; set; }

    [JsonProperty("file_id")]
    public int? FileId { get; set; }

    [JsonProperty("common_file_id")]
    public int? CommonFileId { get; set; }

    [JsonProperty("send_date")]
    public string SendDate { get; set; }

    [JsonProperty("received_date")]
    public string ReceivedDate { get; set; }
}