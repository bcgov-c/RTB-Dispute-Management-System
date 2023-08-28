using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class EmailMessage : BaseEntity
{
    public int EmailMessageId { get; set; }

    [Required]
    public Guid MessageGuid { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public Participant Participant { get; set; }

    public int? ParticipantId { get; set; }

    [Required]
    public byte MessageType { get; set; }

    [Required]
    public AssignedTemplate AssignedTemplateId { get; set; }

    [StringLength(70)]
    public string EmailTo { get; set; }

    [StringLength(70)]
    [Required]
    public string EmailFrom { get; set; }

    [StringLength(255)]
    [Required]
    public string Subject { get; set; }

    [Required]
    public string HtmlBody { get; set; }

    public string TextBody { get; set; }

    [Required]
    public byte BodyType { get; set; }

    public DateTime? PreferredSendDate { get; set; }

    public DateTime? SentDate { get; set; }

    public byte? SendStatus { get; set; }

    [StringLength(100)]
    public string SendStatusMessage { get; set; }

    public DateTime? ResponseDueDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    [Required]
    public byte Retries { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public byte? MessageSubType { get; set; }

    public int? RelatedMessageId { get; set; }

    public int? RelatedObjectId { get; set; }

    public byte SendMethod { get; set; }

    public byte? RecipientGroup { get; set; }

    public virtual ICollection<EmailAttachment> EmailAttachments { get; set; }

    public virtual ICollection<OutcomeDocDelivery> OutcomeDocDeliveries { get; set; }
}