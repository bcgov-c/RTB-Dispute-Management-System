using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailTemplate;

public class EmailTemplateResponse : CommonResponse
{
    [JsonProperty("email_template_id")]
    public int EmailTemplateId { get; set; }

    [JsonProperty("assigned_template_id")]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [JsonProperty("template_group")]
    public TemplateGroup TemplateGroup { get; set; }

    [JsonProperty("template_title")]
    public string TemplateTitle { get; set; }

    [JsonProperty("template_description")]
    public string TemplateDescription { get; set; }

    [JsonProperty("template_access_roles")]
    public byte? TemplateAccessRoles { get; set; }

    [JsonProperty("default_recipient_group")]
    public byte? DefaultRecipientGroup { get; set; }

    [JsonProperty("subject_line")]
    public string SubjectLine { get; set; }

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

    [JsonProperty("reply_email_address")]
    public string ReplyEmailAddress { get; set; }

    [JsonProperty("template_status")]
    public byte? TemplateStatus { get; set; }
}