using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using CM.Messages.EmailNotification.Events;
using CM.Messages.PostedDecision.Events;
using CM.Messages.PostedDecisionDataCollector.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.Base;

public static class EventExtension
{
    public static void Publish(this EmailNotificationIntegrationEvent message, IBus bus)
    {
        bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish email generation event: {CorrelationGuid} {DisputeGuid} {AssignedTemplateId}", message.CorrelationGuid, message.DisputeGuid, message.AssignedTemplateId);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }

    public static void Publish(this EmailGenerateIntegrationEvent message, IBus bus)
    {
        bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish email generation event: {CorrelationGuid} {DisputeGuid} {AssignedTemplateId}", message.CorrelationGuid, message.DisputeGuid, message.AssignedTemplateId);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }

    public static void Publish(this PostedDecisionRemovalEvent message, IBus bus)
    {
        bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish posted decision data collection event: {CorrelationGuid} {DisputeGuid}", message.CorrelationGuid, message.DisputeGuid);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }

    public static void Publish(this PostedDecisionDataCollectionEvent message, IBus bus)
    {
        bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish posted decision data collection event: {CorrelationGuid} {DisputeGuid}", message.CorrelationGuid, message.DisputeGuid);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }

    public static async Task<EmailNotificationIntegrationEvent> GenerateEmailNotificationIntegrationEvent(this EmailMessage emailMessage, IUnitOfWork unitOfWork)
    {
        var emailNotificationIntegrationEvent = new EmailNotificationIntegrationEvent
        {
            CorrelationGuid = Guid.NewGuid(),
            MessageGuid = emailMessage.MessageGuid,
            EmailMessageId = emailMessage.EmailMessageId,
            Title = "RTB DMS Notification",
            DisputeGuid = emailMessage.DisputeGuid,
            PreferredSendDate = DateTime.UtcNow,
            EmailTo = emailMessage.EmailTo,
            EmailFrom = emailMessage.EmailFrom,
            Body = emailMessage.HtmlBody,
            Subject = emailMessage.Subject,
            MessageType = emailMessage.MessageType,
            AssignedTemplateId = emailMessage.AssignedTemplateId,
            ParticipantId = emailMessage.ParticipantId
        };

        if (emailMessage.EmailAttachments is { Count: > 0 })
        {
            emailNotificationIntegrationEvent.EmailAttachments = new List<EmailAttachmentNotificationIntegrationEvent>();

            foreach (var item in emailMessage.EmailAttachments)
            {
                var emailAttachment = new EmailAttachmentNotificationIntegrationEvent { AttachmentType = item.AttachmentType };

                switch (emailAttachment.AttachmentType)
                {
                    case AttachmentType.Common:
                        var commonFile = await unitOfWork.CommonFileRepository.GetByIdAsync(item.CommonFileId.GetValueOrDefault());

                        if (commonFile != null)
                        {
                            emailAttachment.FileId = commonFile.CommonFileId;
                        }

                        break;
                    case AttachmentType.Dispute:
                        var file = await unitOfWork.FileRepository.GetByIdAsync(item.FileId.GetValueOrDefault());

                        if (file != null)
                        {
                            emailAttachment.FileId = file.FileId;
                        }

                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(emailMessage));
                }

                emailNotificationIntegrationEvent.EmailAttachments.Add(emailAttachment);
            }
        }

        return emailNotificationIntegrationEvent;
    }

    public static bool ReadyToSend(this EmailMessage emailMessage)
    {
        return emailMessage.SendStatus == (byte)EmailStatus.UnSent &&
               emailMessage.IsActive &&
               emailMessage.MessageType < (byte)EmailMessageType.Pickup &&
               (emailMessage.PreferredSendDate <= DateTime.UtcNow.AddMinutes(10) || emailMessage.PreferredSendDate == null);
    }
}