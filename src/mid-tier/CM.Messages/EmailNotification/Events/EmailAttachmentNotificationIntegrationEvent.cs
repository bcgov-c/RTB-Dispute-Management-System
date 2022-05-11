using CM.Common.Utilities;

namespace CM.Messages.EmailNotification.Events;

public class EmailAttachmentNotificationIntegrationEvent : BaseMessage
{
    public AttachmentType AttachmentType { get; set; }

    public int FileId { get; set; }
}