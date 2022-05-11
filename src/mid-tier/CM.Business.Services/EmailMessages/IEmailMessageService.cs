using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Services.Base;
using CM.Common.Utilities;

namespace CM.Business.Services.EmailMessages;

public interface IEmailMessageService : IServiceBase, IDisputeResolver
{
    Task<EmailMessageResponse> CreateAsync(Guid disputeGuid, EmailMessageRequest emailMessage);

    Task<bool> DeleteAsync(int emailId);

    Task<EmailMessageResponse> PatchAsync(int emailId, EmailMessageRequestPatch emailMessageRequestPatch, bool triggerEmail);

    Task<EmailMessageRequestPatch> GetForPatchAsync(int emailId);

    Task<EmailMessageResponse> GetByIdAsync(int emailId);

    Task<EmailMessageListResponse> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index);

    Task<bool> IsMessageSentAsync(int emailId);

    Task<bool> EmailMessageExists(int emailId);

    EmailMessageResponse TestTemplates(Guid disputeGuid, AssignedTemplate assignedTemplateId, int messageType);

    Task<bool> SetPickupMessageStatus(int emailMessageId);

    Task<bool> EmailMessageExists(int? associatedEmailId, Guid disputeGuid);
}