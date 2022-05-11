using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class EmailTemplate : BaseEntity
{
    public int EmailTemplateId { get; set; }

    public byte? TemplateType { get; set; }

    [Required]
    [StringLength(100)]
    public string TemplateTitle { get; set; }

    [StringLength(1000)]
    public string TemplateDescription { get; set; }

    public byte? TemplateAccessRoles { get; set; }

    public byte? DefaultRecipientGroup { get; set; }

    [StringLength(150)]
    public string SubjectLine { get; set; }

    public string TemplateHtml { get; set; }

    public int? TemplateAttachment01 { get; set; }

    public int? TemplateAttachment02 { get; set; }

    public int? TemplateAttachment03 { get; set; }

    public int? TemplateAttachment04 { get; set; }

    public int? TemplateAttachment05 { get; set; }

    public int? TemplateAttachment06 { get; set; }

    [StringLength(100)]
    public string ReplyEmailAddress { get; set; }

    public byte? TemplateStatus { get; set; }

    public AssignedTemplate AssignedTemplateId { get; set; }

    public TemplateGroup? TemplateGroup { get; set; }

    public bool? IsDeleted { get; set; }
}