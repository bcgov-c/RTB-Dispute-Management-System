using System;
using CM.Messages.EmailNotification.Events;

namespace CM.Messages.Validation;

public static class MessageValidator
{
    public static void Validate(this BaseMessage baseMessage)
    {
        if (baseMessage.CorrelationGuid == Guid.Empty)
        {
            throw new ArgumentException("CorrelationGuid cannot be empty");
        }

        if (baseMessage is EmailNotificationIntegrationEvent emailNotificationIntegrationEvent &&
            emailNotificationIntegrationEvent.MessageGuid == Guid.Empty)
        {
            throw new ArgumentException("MessageGuid cannot be empty");
        }
    }
}