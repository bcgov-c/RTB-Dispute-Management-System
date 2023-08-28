using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

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

        if (result.ReadyToSend())
        {
            var emailNotificationIntegrationEvent = await result.GenerateEmailNotificationIntegrationEvent(UnitOfWork);
            emailNotificationIntegrationEvent.Publish(Bus);
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
            emailGenerationIntegrationEvent.Publish(Bus);
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

        if (triggerEmail && emailMessageToPatch.ReadyToSend())
        {
            var emailNotificationIntegrationEvent = await emailMessageToPatch.GenerateEmailNotificationIntegrationEvent(UnitOfWork);
            emailNotificationIntegrationEvent.Publish(Bus);
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
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetNoTrackingByIdAsync(e => e.EmailMessageId == emailId);
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
        return email?.SendStatus == (byte)EmailStatus.Sent;
    }

    public async Task<bool> EmailMessageExists(int emailId)
    {
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetByIdAsync(emailId);
        return emailMessage != null;
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
        var exists = await UnitOfWork.EmailMessageRepository.EmailMessageExists(associatedEmailId.GetValueOrDefault(), disputeGuid);
        return exists;
    }

    public async Task<bool> CreateAsync(Participant participant)
    {
        var emailTemplate = await UnitOfWork.EmailTemplateRepository
            .GetByEmailTypeAsync(AssignedTemplate.ParticipantVerificationEmail);

        var newEmailMessage = new EmailMessage();
        newEmailMessage.DisputeGuid = participant.DisputeGuid;
        newEmailMessage.ParticipantId = participant.ParticipantId;
        newEmailMessage.MessageType = (byte)EmailMessageType.SystemEmail;
        newEmailMessage.AssignedTemplateId = AssignedTemplate.ParticipantVerificationEmail;
        newEmailMessage.EmailTo = participant.Email;
        newEmailMessage.EmailFrom = emailTemplate.ReplyEmailAddress;
        newEmailMessage.Subject = await GetReplacedSubject(emailTemplate.SubjectLine, participant);
        newEmailMessage.HtmlBody = await GetReplacedBody(emailTemplate.TemplateHtml, participant);
        newEmailMessage.IsActive = true;
        newEmailMessage.MessageGuid = Guid.NewGuid();
        newEmailMessage.IsDeleted = false;

        var result = await UnitOfWork.EmailMessageRepository.InsertAsync(newEmailMessage);
        var res = await UnitOfWork.Complete();

        if (res.CheckSuccess())
        {
            var emailNotificationIntegrationEvent = await result.GenerateEmailNotificationIntegrationEvent(UnitOfWork);
            emailNotificationIntegrationEvent.Publish(Bus);
            return true;
        }

        return false;
    }

    public async Task<bool> VerifyCode(Participant participant, EmailVerificationRequest request)
    {
        switch (request.VerificationType)
        {
            case VerificationType.Email:
                participant.EmailVerified = true;
                break;
            case VerificationType.PrimaryPhone:
                participant.PrimaryPhoneVerified = true;
                break;
            case VerificationType.SecondaryPhone:
                participant.SecondaryPhoneVerified = true;
                break;
        }

        UnitOfWork.ParticipantRepository.Update(participant);
        var res = await UnitOfWork.Complete();

        return res.CheckSuccess();
    }

    public async Task<ExternalEmailMessagesResponse> GetExternalDisputeEmailMessages(Guid disputeGuid, ExternalEmailMessagesRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var(emailMessages, totalCount) = await UnitOfWork.EmailMessageRepository.GetExternalEmailMessages(disputeGuid, request);
        if (emailMessages != null)
        {
            var emailResponse = new ExternalEmailMessagesResponse
            {
                EmailMessages = MapperService.Map<List<EmailMessage>, List<ExternalEmailMessageResponse>>(emailMessages).ApplyPaging(count, index),
                TotalAvailableCount = totalCount
            };
            return emailResponse;
        }

        return null;
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

    private async Task<string> GetReplacedBody(string templateHtml, Participant participant)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDispute(participant.DisputeGuid);
        var disputeAccessUrl = await UnitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.DisputeAccessUrl);
        var builder = new StringBuilder(templateHtml);
        builder.Replace("{file_number}", dispute.FileNumber.ToString());
        builder.Replace("{email-verify-code}", participant.EmailVerifyCode);
        builder.Replace("{dispute_access_url}", disputeAccessUrl.Value);

        return builder.ToString();
    }

    private async Task<string> GetReplacedSubject(string subjectLine, Participant participant)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDispute(participant.DisputeGuid);
        var builder = new StringBuilder(subjectLine);
        builder.Replace("<file_number>", dispute.FileNumber.ToString());

        return builder.ToString();
    }
}