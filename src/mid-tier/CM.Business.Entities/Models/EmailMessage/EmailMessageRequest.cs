using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage;

public class EmailMessageRequest
{
    [JsonProperty("message_type")]
    [Required]
    public byte MessageType { get; set; }

    [JsonProperty("assigned_template_id")]
    [Required]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [JsonProperty("email_to")]
    [StringLength(70)]
    public string EmailTo { get; set; }

    [JsonProperty("email_from")]
    [Required]
    [StringLength(70)]
    public string EmailFrom { get; set; }

    [JsonProperty("subject")]
    [Required]
    [StringLength(250)]
    public string Subject { get; set; }

    [JsonProperty("html_body")]
    [Required]
    public string HtmlBody { get; set; }

    [JsonProperty("text_body")]
    public string TextBody { get; set; }

    [JsonProperty("body_type")]
    [Required]
    public byte BodyType { get; set; }

    [JsonProperty("preferred_send_date")]
    public DateTime PreferredSendDate { get; set; }

    [JsonProperty("response_due_date")]
    public DateTime ResponseDueDate { get; set; }

    [JsonProperty("is_active", DefaultValueHandling = DefaultValueHandling.Populate)]
    [Required]
    [DefaultValue(true)]
    public bool IsActive { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("message_sub_type")]
    public byte? MessageSubType { get; set; }

    [JsonProperty("related_message_id")]
    public int? RelatedMessageId { get; set; }

    [JsonProperty("related_object_id")]
    public int? RelatedObjectId { get; set; }

    [JsonProperty("send_method")]
    [Required]
    public EmailSendMethod? SendMethod { get; set; }

    [JsonProperty("send_status")]
    public byte? SendStatus { get; set; }

    [JsonProperty("recipient_group")]
    public byte? RecipientGroup { get; set; }
}

public class EmailMessageRequestPatch
{
    [JsonProperty("message_type")]
    [Required]
    public byte MessageType { get; set; }

    [JsonProperty("send_status")]
    public byte? SendStatus { get; set; }

    [JsonProperty("assigned_template_id")]
    [Required]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [JsonProperty("email_to")]
    [Required]
    [StringLength(70)]
    public string EmailTo { get; set; }

    [JsonProperty("email_from")]
    [Required]
    [StringLength(70)]
    public string EmailFrom { get; set; }

    [JsonProperty("subject")]
    [Required]
    [StringLength(250)]
    public string Subject { get; set; }

    [JsonProperty("html_body")]
    [Required]
    public string HtmlBody { get; set; }

    [JsonProperty("text_body")]
    public string TextBody { get; set; }

    [JsonProperty("body_type")]
    [Required]
    public byte BodyType { get; set; }

    [JsonProperty("preferred_send_date")]
    public DateTime PreferredSendDate { get; set; }

    [JsonProperty("response_due_date")]
    public DateTime ResponseDueDate { get; set; }

    [JsonProperty("is_active", DefaultValueHandling = DefaultValueHandling.Populate)]
    [Required]
    [DefaultValue(true)]
    public bool IsActive { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("message_sub_type")]
    public byte? MessageSubType { get; set; }

    [JsonProperty("related_message_id")]
    public int? RelatedMessageId { get; set; }

    [JsonProperty("related_object_id")]
    public int? RelatedObjectId { get; set; }

    [JsonProperty("received_date")]
    public DateTime? ReceivedDate { get; set; }

    [JsonIgnore]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("recipient_group")]
    public byte? RecipientGroup { get; set; }
}