using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailTemplate;

public class EmailTemplateRequest
{
    [Required]
    [JsonProperty("assigned_template_id")]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [Required]
    [JsonProperty("template_group")]
    public TemplateGroup TemplateGroup { get; set; }

    [Required]
    [StringLength(100)]
    [JsonProperty("template_title")]
    public string TemplateTitle { get; set; }

    [Required]
    [StringLength(1000)]
    [MinLength(10)]
    [JsonProperty("template_description")]
    public string TemplateDescription { get; set; }

    [JsonProperty("template_access_roles")]
    public byte? TemplateAccessRoles { get; set; }

    [Required]
    [JsonProperty("default_recipient_group")]
    public byte? DefaultRecipientGroup { get; set; }

    [Required]
    [StringLength(150)]
    [JsonProperty("subject_line")]
    public string SubjectLine { get; set; }

    [Required]
    [JsonProperty("template_html")]
    public string TemplateHtml { get; set; }

    [JsonProperty("template_attachment_01")]
    public int? TemplateAttachment01 { get; set; }

    [JsonProperty("template_attachment_02")]
    public int? TemplateAttachment02 { get; set; }

    [JsonProperty("template_attachment_03")]
    public int? TemplateAttachment03 { get; set; }

    [JsonProperty("template_attachment_04")]
    public int? TemplateAttachment04 { get; set; }

    [JsonProperty("template_attachment_05")]
    public int? TemplateAttachment05 { get; set; }

    [JsonProperty("template_attachment_06")]
    public int? TemplateAttachment06 { get; set; }

    [Required]
    [StringLength(100)]
    [JsonProperty("reply_email_address")]
    public string ReplyEmailAddress { get; set; }

    [Required]
    [JsonProperty("template_status")]
    public byte? TemplateStatus { get; set; }
}