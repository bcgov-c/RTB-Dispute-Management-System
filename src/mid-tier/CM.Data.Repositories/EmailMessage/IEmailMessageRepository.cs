using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailMessage;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.EmailMessage;

public interface IEmailMessageRepository : IRepository<Model.EmailMessage>
{
    Task<Model.EmailMessage> GetEmailByMessageGuid(Guid messageGuid);

    Task<List<Model.EmailMessage>> GetEmailMessagesByDisputeGuidAsync(Guid disputeGuid, int count, int index);

    Task<int> GetEmailMessagesCountAsync(Guid disputeGuid);

    Task<Model.EmailMessage> GetWithEmailAttachmentsAsync(int emailId);

    Task<Model.EmailMessage> GetEmailByIdAndDispute(int id, Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDateAsync(int emailMessageId);

    Task<bool> EmailMessageExists(int emailMessageId, Guid disputeGuid);

    Task<List<Model.EmailMessage>> GetUnsentEmails(int maxBatchSize = 1000);

    Task<List<Model.EmailMessage>> GetErrorEmails(int emailErrorResentHoursAgo = 1, int maxBatchSize = 1000);

    Task<(List<Model.EmailMessage> emailMessages, int totalCount)> GetExternalEmailMessages(Guid disputeGuid, ExternalEmailMessagesRequest request);
}