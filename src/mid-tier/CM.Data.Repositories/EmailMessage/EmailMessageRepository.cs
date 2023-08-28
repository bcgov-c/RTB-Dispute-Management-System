using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailMessage;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.EmailMessage;

public class EmailMessageRepository : CmRepository<Model.EmailMessage>, IEmailMessageRepository
{
    public EmailMessageRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.EmailMessage> GetEmailByMessageGuid(Guid messageGuid)
    {
        if (messageGuid == Guid.Empty)
        {
            return null;
        }

        return await Context.EmailMessages.FirstOrDefaultAsync(x => x.MessageGuid == messageGuid);
    }

    public async Task<Model.EmailMessage> GetEmailByIdAndDispute(int id, Guid disputeGuid)
    {
        var email = await Context.EmailMessages
            .FirstOrDefaultAsync(x => x.EmailMessageId == id && x.DisputeGuid == disputeGuid);

        return email;
    }

    public async Task<List<Model.EmailMessage>> GetEmailMessagesByDisputeGuidAsync(Guid disputeGuid, int count, int index)
    {
        var emailMessages = await Context.EmailMessages
            .Where(e => e.DisputeGuid == disputeGuid)
            .ApplyPaging(count, index)
            .ToListAsync();

        foreach (var item in emailMessages)
        {
            item.EmailAttachments = await Context.EmailAttachments
                .Where(e => e.EmailMessageId == item.EmailMessageId && e.IsDeleted == false)
                .ToListAsync();
        }

        return emailMessages;
    }

    public async Task<int> GetEmailMessagesCountAsync(Guid disputeGuid)
    {
        var emailsCount = await Context.EmailMessages
            .Where(e => e.DisputeGuid == disputeGuid)
            .CountAsync();

        return emailsCount;
    }

    public async Task<Model.EmailMessage> GetWithEmailAttachmentsAsync(int emailId)
    {
        var emailMessage = await Context.EmailMessages
            .SingleOrDefaultAsync(e => e.EmailMessageId == emailId);

        if (emailMessage != null)
        {
            emailMessage.EmailAttachments = await Context.EmailAttachments
                .Where(e => e.EmailMessageId == emailId && e.IsDeleted == false)
                .ToListAsync();
        }

        return emailMessage;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int emailMessageId)
    {
        var dates = await Context.EmailMessages
            .Where(p => p.EmailMessageId == emailMessageId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates.FirstOrDefault();
    }

    public async Task<bool> EmailMessageExists(int emailMessageId, Guid disputeGuid)
    {
        var exists = await Context.EmailMessages.AnyAsync(x => x.EmailMessageId == emailMessageId && x.DisputeGuid == disputeGuid);
        return exists;
    }

    public async Task<List<Model.EmailMessage>> GetUnsentEmails(int maxBatchSize = 1000)
    {
        var emailMessages = await Context.EmailMessages
            .Where(e => e.SendStatus == (byte)EmailStatus.UnSent &&
                        e.IsActive &&
                        e.MessageType < (byte)EmailMessageType.Pickup &&
                        e.SendStatus != (byte)EmailStatus.Pending &&
                        e.PreferredSendDate <= DateTime.UtcNow.AddMinutes(10))
            .Include(x => x.EmailAttachments)
            .ApplyPaging(maxBatchSize, 0)
            .ToListAsync();

        return emailMessages;
    }

    public async Task<List<Model.EmailMessage>> GetErrorEmails(int emailErrorResentHoursAgo = 1, int maxBatchSize = 1000)
    {
        var emailMessages = await Context.EmailMessages
            .Where(e => e.SendStatus == (byte)EmailStatus.Error &&
                        e.IsActive &&
                        e.MessageType < (byte)EmailMessageType.Pickup &&
                        e.SendStatus != (byte)EmailStatus.Pending &&
                        e.SentDate == null &&
                        e.CreatedDate >= DateTime.UtcNow.AddHours(-emailErrorResentHoursAgo))
            .Include(x => x.EmailAttachments)
            .ApplyPaging(maxBatchSize, 0)
            .ToListAsync();

        return emailMessages;
    }

    public async Task<(List<Model.EmailMessage> emailMessages, int totalCount)> GetExternalEmailMessages(Guid disputeGuid, ExternalEmailMessagesRequest request)
    {
        var emailMessages = await Context.EmailMessages
            .Where(e => e.DisputeGuid == disputeGuid &&
                            e.ParticipantId.HasValue &&
                            request.Participants.Contains(e.ParticipantId.Value) &&
                            e.SendStatus == (byte?)EmailStatus.Sent)
            .ToListAsync();

        foreach (var item in emailMessages)
        {
            item.EmailAttachments = await Context.EmailAttachments
                .Where(e => e.EmailMessageId == item.EmailMessageId && e.IsDeleted == false)
                .ToListAsync();
        }

        return (emailMessages, emailMessages.Count);
    }
}