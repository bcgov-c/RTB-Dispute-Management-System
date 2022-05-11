using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.EmailMessage;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using CM.Messages.EmailNotification.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.EmailMessages;

public class EmailMessageService : CmServiceBase, IEmailMessageService
{
    public EmailMessageService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
    }

    private IBus Bus { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.EmailMessageRepository.GetNoTrackingByIdAsync(x => x.EmailMessageId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<EmailMessageResponse> CreateAsync(Guid disputeGuid, EmailMessageRequest emailMessage)
    {
        var newEmailMessage = MapperService.Map<EmailMessageRequest, EmailMessage>(emailMessage);
        newEmailMessage.DisputeGuid = disputeGuid;
        newEmailMessage.MessageGuid = Guid.NewGuid();
        newEmailMessage.IsDeleted = false;
        if (!emailMessage.SendStatus.HasValue)
        {
            newEmailMessage.SendStatus = (byte)EmailStatus.UnSent;
        }

        var result = await UnitOfWork.EmailMessageRepository.InsertAsync(newEmailMessage);
        await UnitOfWork.Complete();

        if (newEmailMessage.SendStatus == (byte)EmailStatus.UnSent && newEmailMessage.IsActive && newEmailMessage.MessageType < (byte)EmailMessageType.Pickup)
        {
            var emailNotificationIntegrationEvent = await GenerateEmailNotificationIntegrationEvent(result);

            Publish(emailNotificationIntegrationEvent);
        }

        return MapperService.Map<EmailMessage, EmailMessageResponse>(result);
    }

    public EmailMessageResponse TestTemplates(Guid disputeGuid, AssignedTemplate assignedTemplateId, int messageType)
    {
        var newEmailMessage = new EmailMessage
        {
            IsDeleted = false,
            DisputeGuid = disputeGuid,
            AssignedTemplateId = assignedTemplateId,
            SendStatus = (byte)EmailStatus.UnSent,
            MessageType = (byte)assignedTemplateId,
            IsActive = false
        };
        var payorId = 0;

        if (assignedTemplateId == AssignedTemplate.PaymentSubmitted)
        {
            var disputeFees = UnitOfWork.DisputeFeeRepository.GetByDisputeGuid(disputeGuid);
            var lastDisputeFee = disputeFees?.Result.LastOrDefault();
            if (lastDisputeFee?.PayorId != null)
            {
                payorId = (int)lastDisputeFee.PayorId;
            }
        }

        if (messageType == (byte)EmailMessageType.Manual)
        {
            var emailGenerationIntegrationEvent = GenerateEmailGenerationIntegrationEvent(newEmailMessage, payorId);
            Publish(emailGenerationIntegrationEvent);
        }

        return MapperService.Map<EmailMessage, EmailMessageResponse>(newEmailMessage);
    }

    public async Task<bool> DeleteAsync(int emailId)
    {
        var emailToDelete = await UnitOfWork.EmailMessageRepository.GetByIdAsync(emailId);
        if (emailToDelete != null)
        {
            emailToDelete.IsDeleted = true;
            UnitOfWork.EmailMessageRepository.Attach(emailToDelete);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<EmailMessageResponse> PatchAsync(int emailId, EmailMessageRequestPatch emailMessageRequestPatch, bool triggerEmail)
    {
        var emailMessageToPatch = await
            UnitOfWork.EmailMessageRepository.GetWithEmailAttachmentsAsync(emailId);

        MapperService.Map(emailMessageRequestPatch, emailMessageToPatch);

        if (triggerEmail && emailMessageToPatch.MessageType < (byte)EmailMessageType.Pickup)
        {
            var emailNotificationIntegrationEvent = await GenerateEmailNotificationIntegrationEvent(emailMessageToPatch);

            Publish(emailNotificationIntegrationEvent);
        }

        UnitOfWork.EmailMessageRepository.Attach(emailMessageToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<EmailMessage, EmailMessageResponse>(emailMessageToPatch);
        }

        return null;
    }

    public async Task<EmailMessageRequestPatch> GetForPatchAsync(int emailId)
    {
        var emailMessage = await
            UnitOfWork.EmailMessageRepository.GetNoTrackingByIdAsync(e => e.EmailMessageId == emailId);
        return MapperService.Map<EmailMessage, EmailMessageRequestPatch>(emailMessage);
    }

    public async Task<EmailMessageResponse> GetByIdAsync(int emailId)
    {
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetWithEmailAttachmentsAsync(emailId);
        if (emailMessage != null)
        {
            return MapperService.Map<EmailMessage, EmailMessageResponse>(emailMessage);
        }

        return null;
    }

    public async Task<EmailMessageListResponse> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var emailMessages = await UnitOfWork.EmailMessageRepository.GetEmailMessagesByDisputeGuidAsync(disputeGuid, count, index);
        if (emailMessages != null)
        {
            var emailResponse = new EmailMessageListResponse
            {
                EmailMessages = MapperService.Map<List<EmailMessage>, List<EmailMessageResponse>>(emailMessages.OrderByDescending(d => d.ModifiedDate).ToList()),
                TotalAvailableCount = await UnitOfWork.EmailMessageRepository.GetEmailMessagesCountAsync(disputeGuid)
            };
            return emailResponse;
        }

        return null;
    }

    public async Task<bool> IsMessageSentAsync(int emailId)
    {
        var email = await UnitOfWork.EmailMessageRepository.GetByIdAsync(emailId);
        if (email?.SendStatus == (byte)EmailStatus.Sent)
        {
            return true;
        }

        return false;
    }

    public async Task<bool> EmailMessageExists(int emailId)
    {
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetByIdAsync(emailId);
        if (emailMessage != null)
        {
            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var emailMessageLastModified = await UnitOfWork.EmailMessageRepository.GetLastModifiedDateAsync((int)id);
        return emailMessageLastModified;
    }

    public async Task<bool> SetPickupMessageStatus(int emailMessageId)
    {
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetByIdAsync(emailMessageId);
        emailMessage.SendStatus = (byte)EmailStatus.PickedUp;
        UnitOfWork.EmailMessageRepository.Attach(emailMessage);
        var result = await UnitOfWork.Complete();
        return result.CheckSuccess();
    }

    public async Task<bool> EmailMessageExists(int? associatedEmailId, Guid disputeGuid)
    {
        var exists = await UnitOfWork.EmailMessageRepository.EmailMessageExists(associatedEmailId.Value, disputeGuid);
        return exists;
    }

    private async Task<EmailNotificationIntegrationEvent> GenerateEmailNotificationIntegrationEvent(EmailMessage emailMessage)
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
                        var commonFile = await UnitOfWork.CommonFileRepository.GetByIdAsync(item.CommonFileId.GetValueOrDefault());

                        if (commonFile != null)
                        {
                            emailAttachment.FileId = commonFile.CommonFileId;
                        }

                        break;
                    case AttachmentType.Dispute:
                        var file = await UnitOfWork.FileRepository.GetByIdAsync(item.FileId.GetValueOrDefault());

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

    private EmailGenerateIntegrationEvent GenerateEmailGenerationIntegrationEvent(EmailMessage emailMessage, int payorId)
    {
        var emailNotificationIntegrationEvent = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = emailMessage.DisputeGuid,
            AssignedTemplateId = emailMessage.AssignedTemplateId,
            MessageType = EmailMessageType.Manual,
            ParticipantId = payorId
        };

        return emailNotificationIntegrationEvent;
    }

    private void Publish(EmailGenerateIntegrationEvent message)
    {
        Bus.PubSub.PublishAsync(message)
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

    private void Publish(EmailNotificationIntegrationEvent message)
    {
        Bus.PubSub.PublishAsync(message)
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
}