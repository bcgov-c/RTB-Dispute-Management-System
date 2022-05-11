using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.BulkEmailRecipient;

public class BulkEmailRecipientRequest
{
    [JsonProperty("bulk_email_batch_id")]
    public int BulkEmailBatchId { get; set; }

    [JsonProperty("email_template_id")]
    public byte EmailTemplateId { get; set; }

    [JsonProperty("email_subject")]
    public string EmailSubject { get; set; }

    [EmailAddress(ErrorMessage ="Invalid e-mail address")]
    [JsonProperty("reply_email_address")]
    public string ReplyEmailAddress { get; set; }
}