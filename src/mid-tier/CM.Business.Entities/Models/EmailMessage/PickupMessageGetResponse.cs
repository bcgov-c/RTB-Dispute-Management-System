using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage;

public class PickupMessageGetResponse : CommonResponse
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("message_type")]
    public byte MessageType { get; set; }

    [JsonProperty("message_sub_type")]
    public byte? MessageSubType { get; set; }

    [JsonProperty("assigned_template_id")]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [JsonProperty("subject")]
    public string Subject { get; set; }

    [JsonProperty("html_body")]
    public string HtmlBody { get; set; }

    [JsonProperty("send_status")]
    public byte SendStatus { get; set; }

    [JsonProperty("recipient_group")]
    public byte? RecipientGroup { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("email_attachments")]
    public ICollection<PickupEmailAttachmentResponse> EmailAttachments { get; set; }
}