using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage
{
    public class ExternalEmailMessageResponse : CommonResponse
    {
        [JsonProperty("email_id")]
        public int EmailMessageId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("recipient_group")]
        public byte? RecipientGroup { get; set; }

        [JsonProperty("message_type")]
        public byte MessageType { get; set; }

        [JsonProperty("message_sub_type")]
        public byte? MessageSubType { get; set; }

        [JsonProperty("related_message_id")]
        public int? RelatedMessageId { get; set; }

        [JsonProperty("assigned_template_id")]
        public AssignedTemplate AssignedTemplateId { get; set; }

        [JsonProperty("related_object_id")]
        public int? RelatedObjectId { get; set; }

        [JsonProperty("send_method")]
        public byte SendMethod { get; set; }

        [JsonProperty("email_to")]
        public string EmailTo { get; set; }

        [JsonProperty("email_from")]
        public string EmailFrom { get; set; }

        [JsonProperty("subject")]
        public string Subject { get; set; }

        [JsonProperty("html_body")]
        public string HtmlBody { get; set; }

        [JsonProperty("text_body")]
        public string TextBody { get; set; }

        [JsonProperty("body_type")]
        public byte BodyType { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("sent_date")]
        public string SentDate { get; set; }

        [JsonProperty("send_status")]
        public byte SendStatus { get; set; }

        [JsonProperty("email_attachments")]
        public ICollection<ExternalEmailAttachmentResponse> EmailAttachments { get; set; }
    }
}
