using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.BulkEmailRecipient;

public interface IBulkEmailRecipientRepository : IRepository<Model.BulkEmailRecipient>
{
    Task<List<Model.BulkEmailRecipient>> GetBulkEmailRecipients(int bulkEmailBatchId);

    Task<DateTime?> GetLastModifiedDateAsync(int id);

    Task<bool> IsAnyBulkEmailBatchId(int bulkEmailBatchId);
}