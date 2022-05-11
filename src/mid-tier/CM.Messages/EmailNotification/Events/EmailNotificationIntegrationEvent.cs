using System;
using System.Collections.Generic;
using CM.Common.Utilities;

namespace CM.Messages.EmailNotification.Events;

public class EmailNotificationIntegrationEvent : BaseMessage
{
    public Guid MessageGuid { get; set; } = Guid.NewGuid();

    public int EmailMessageId { get; set; }

    public Guid DisputeGuid { get; set; }

    public byte MessageType { get; set; }

    public string EmailTo { get; set; }

    public string EmailFrom { get; set; }

    public int? ParticipantId { get; set; }

    public string Title { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }

    public AssignedTemplate AssignedTemplateId { get; set; }

    public DateTime? PreferredSendDate { get; set; }

    public byte Retries { get; set; }

    public virtual ICollection<EmailAttachmentNotificationIntegrationEvent> EmailAttachments { get; set; }
}